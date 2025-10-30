
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import pandas as pd
from loguru import logger

from app.services.advanced_model_service import AdvancedModelService
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.models import APIResponse

router = APIRouter()

@router.post(
    "/classify-upload",
    summary="Classify Articles from CSV Upload",
    description="""
    Upload a CSV file with articles and classify them based on company objectives.

    **CSV Format Requirements:**
    - Required columns: `title`, `content`
    - Optional columns: `id`, `url`, `source`, `published_date`, `created_at`

    **Classification Categories:**
    - **Directly Relevant**: Articles that directly support company objectives
    - **Indirectly Useful**: Articles related to the broader ecosystem
    - **Not Relevant**: Articles with no meaningful connection

    **Features:**
    - Transformer-based classification (F1-Score: 0.951)
    - Weak supervision using semantic similarity
    - Hybrid classification logic
    - Confidence scores and probabilities
    """,
    response_description="Articles classified successfully"
)
async def classify_articles_upload(
    file: UploadFile = File(..., description="CSV file containing articles"),
    company_objective: str = Form(..., description="Company objective for classification"),
    use_custom_objective: bool = Form(True, description="Use custom objective for weak supervision")
):
    try:
        logger.info(f"Received classification request for file: {file.filename}")

        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="File must be a CSV file"
            )

        content = await file.read()

        logger.info("Processing CSV file...")
        data_processor = AdvancedDataProcessor()
        try:
            df = data_processor.process_csv(content)
            logger.info(f"CSV processed successfully: {len(df)} articles found")
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )

        logger.info("Initializing classification model...")
        model_service = AdvancedModelService()

        logger.info(f"Classifying {len(df)} articles with objective: {company_objective[:100]}...")
        results = model_service.classify_articles(
            df=df,
            company_objective=company_objective,
            use_custom_objective=use_custom_objective
        )

        logger.info("Classification completed successfully")

        response_data = {
            'total_articles': len(df),
            'classification_results': results,
            'company_objective': company_objective,
            'file_info': {
                'filename': file.filename,
                'articles_count': len(df)
            }
        }

        return APIResponse(
            success=True,
            message=f"Successfully classified {len(df)} articles",
            data=response_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Classification failed: {str(e)}"
        )

@router.get(
    "/model-info",
    summary="Get Model Information",
    description="Get information about the classification model including performance metrics",
    response_description="Model information retrieved successfully"
)
async def get_model_info():
    try:
        logger.info("Fetching model information...")

        model_service = AdvancedModelService()

        if not model_service.is_model_loaded():
            raise HTTPException(
                status_code=503,
                detail="Model is not loaded. Please check model files."
            )

        model_info = {
            'model_type': model_service.config['model_type'],
            'performance_metrics': model_service.config['performance_metrics'],
            'training_data': model_service.config['training_data'],
            'model_path': str(model_service.model_path),
            'thresholds': model_service.config.get('thresholds', {}),
            'label_mapping': model_service.config['label_mapping'],
            'features': {
                'transformer_embeddings': 'all-MiniLM-L6-v2',
                'embedding_dimensions': 384,
                'weak_supervision': True,
                'hybrid_classification': True,
                'keyword_boosting': True
            },
            'categories': [
                {
                    'id': 0,
                    'name': 'Not Relevant',
                    'description': 'Articles with no meaningful connection to company objectives'
                },
                {
                    'id': 1,
                    'name': 'Indirectly Useful',
                    'description': 'Articles related to the broader ecosystem'
                },
                {
                    'id': 2,
                    'name': 'Directly Relevant',
                    'description': 'Articles that directly support company objectives'
                }
            ]
        }

        return APIResponse(
            success=True,
            message="Model information retrieved successfully",
            data=model_info
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get model info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get model info: {str(e)}"
        )

@router.post(
    "/classify-text",
    summary="Classify Single Article",
    description="Classify a single article by providing title and content directly",
    response_description="Article classified successfully"
)
async def classify_single_article(
    title: str = Form(..., description="Article title"),
    content: str = Form(..., description="Article content"),
    company_objective: str = Form(..., description="Company objective for classification"),
    use_custom_objective: bool = Form(True, description="Use custom objective for weak supervision")
):
    try:
        logger.info(f"Received single article classification request")

        df = pd.DataFrame([{
            'title': title,
            'content': content
        }])

        model_service = AdvancedModelService()

        logger.info("Classifying article...")
        results = model_service.classify_articles(
            df=df,
            company_objective=company_objective,
            use_custom_objective=use_custom_objective
        )

        article_result = results['results'][0]

        response_data = {
            'article': {
                'title': title,
                'content': content[:500] + '...' if len(content) > 500 else content
            },
            'classification': article_result,
            'company_objective': company_objective,
            'model_info': results['model_info']
        }

        return APIResponse(
            success=True,
            message="Article classified successfully",
            data=response_data
        )

    except Exception as e:
        logger.error(f"Classification failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Classification failed: {str(e)}"
        )
