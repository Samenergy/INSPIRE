"""Summarization router for article summarization endpoints."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
import pandas as pd
from loguru import logger

from app.services.summarization_service import SummarizationService
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.models import APIResponse

router = APIRouter()


@router.post(
    "/summarize-upload",
    summary="Summarize Articles from CSV Upload",
    description="""
    Upload a CSV file with articles and generate summaries for each article.
    
    **CSV Format Requirements:**
    - Required columns: `title`, `content`
    - Optional columns: `id`, `url`, `source`, `published_date`, `created_at`
    
    **Summarization Features:**
    - Enhanced extractive summarization
    - TF-IDF-based sentence ranking
    - Named entity recognition
    - Numerical data prioritization
    - Domain-specific keyword focus
    """,
    response_description="Articles summarized successfully"
)
async def summarize_articles_upload(
    file: UploadFile = File(..., description="CSV file containing articles"),
    max_sentences: Optional[int] = Form(3, description="Maximum number of sentences in summary"),
    domain: str = Form("general", description="Domain for specialized summarization (general, business, tech, finance)")
):
    """
    Summarize articles from uploaded CSV file.
    
    **Request:**
    - **file**: CSV file with articles (required columns: title, content)
    - **max_sentences**: Maximum sentences in each summary (default: 3)
    - **domain**: Domain for specialized summarization
    
    **Returns:**
    - Summarized articles
    - Original and summary lengths
    - Summary statistics
    """
    try:
        logger.info(f"Received summarization request for file: {file.filename}")
        
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="File must be a CSV file"
            )
        
        # Read file content
        content = await file.read()
        
        # Process CSV
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
        
        # Initialize summarization service
        logger.info("Initializing summarization service...")
        summarization_service = SummarizationService()
        
        # Prepare articles for summarization
        articles = []
        for _, row in df.iterrows():
            articles.append({
                'title': row['title'],
                'content': row['content'],
                'id': row.get('id', ''),
                'url': row.get('url', ''),
                'source': row.get('source', '')
            })
        
        # Summarize articles
        logger.info(f"Summarizing {len(articles)} articles...")
        summarized_articles = summarization_service.summarize_articles(
            articles=articles,
            max_sentences=max_sentences,
            domain=domain
        )
        
        # Get statistics
        stats = summarization_service.get_summary_statistics(summarized_articles)
        
        logger.info("Summarization completed successfully")
        
        # Prepare response
        response_data = {
            'total_articles': len(summarized_articles),
            'summarized_articles': summarized_articles,
            'statistics': stats,
            'parameters': {
                'max_sentences': max_sentences,
                'domain': domain
            },
            'file_info': {
                'filename': file.filename,
                'articles_count': len(df)
            }
        }
        
        return APIResponse(
            success=True,
            message=f"Successfully summarized {len(summarized_articles)} articles",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {str(e)}"
        )


@router.post(
    "/summarize-text",
    summary="Summarize Single Article",
    description="Summarize a single article by providing title and content directly",
    response_description="Article summarized successfully"
)
async def summarize_single_article(
    title: str = Form(..., description="Article title"),
    content: str = Form(..., description="Article content"),
    max_sentences: Optional[int] = Form(3, description="Maximum number of sentences in summary"),
    domain: str = Form("general", description="Domain for specialized summarization")
):
    """
    Summarize a single article.
    
    **Request:**
    - **title**: Article title
    - **content**: Article content
    - **max_sentences**: Maximum sentences in summary (default: 3)
    - **domain**: Domain for specialized summarization
    
    **Returns:**
    - Original article
    - Generated summary
    - Summary statistics
    """
    try:
        logger.info(f"Received single article summarization request")
        
        # Initialize summarization service
        summarization_service = SummarizationService()
        
        # Generate summary
        logger.info("Generating summary...")
        summary = summarization_service.summarize_article(
            content=content,
            title=title,
            max_sentences=max_sentences,
            domain=domain
        )
        
        # Calculate statistics
        original_length = len(content)
        summary_length = len(summary)
        compression_ratio = summary_length / original_length if original_length > 0 else 0
        
        response_data = {
            'article': {
                'title': title,
                'content': content,
                'content_length': original_length
            },
            'summary': {
                'text': summary,
                'length': summary_length,
                'sentences': len(summary.split('.')) if summary else 0
            },
            'statistics': {
                'compression_ratio': compression_ratio,
                'original_length': original_length,
                'summary_length': summary_length
            },
            'parameters': {
                'max_sentences': max_sentences,
                'domain': domain
            }
        }
        
        return APIResponse(
            success=True,
            message="Article summarized successfully",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {str(e)}"
        )


@router.post(
    "/classify-and-summarize",
    summary="Classify and Summarize Articles",
    description="""
    Upload a CSV file, classify articles, and generate summaries for relevant ones.
    
    This endpoint combines classification and summarization in one request:
    1. Classifies articles based on company objectives
    2. Summarizes articles marked as "Directly Relevant" or "Indirectly Useful"
    
    **CSV Format Requirements:**
    - Required columns: `title`, `content`
    - Optional columns: `id`, `url`, `source`, `published_date`, `created_at`
    """,
    response_description="Articles classified and summarized successfully"
)
async def classify_and_summarize_articles(
    file: UploadFile = File(..., description="CSV file containing articles"),
    company_objective: str = Form(..., description="Company objective for classification"),
    max_sentences: Optional[int] = Form(3, description="Maximum number of sentences in summary"),
    domain: str = Form("general", description="Domain for specialized summarization"),
    use_custom_objective: bool = Form(True, description="Use custom objective for weak supervision")
):
    """
    Classify and summarize articles in one request.
    
    **Request:**
    - **file**: CSV file with articles
    - **company_objective**: Business objective for classification
    - **max_sentences**: Maximum sentences in summaries
    - **domain**: Domain for specialized summarization
    - **use_custom_objective**: Enable weak supervision
    
    **Returns:**
    - Classification results
    - Summaries for relevant articles
    - Combined statistics
    """
    try:
        logger.info(f"Received classify-and-summarize request for file: {file.filename}")
        
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="File must be a CSV file"
            )
        
        # Read file content
        content = await file.read()
        
        # Process CSV
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
        
        # Step 1: Classify articles
        logger.info("Step 1: Classifying articles...")
        from app.services.advanced_model_service import AdvancedModelService
        model_service = AdvancedModelService()
        
        classification_results = model_service.classify_articles(
            df=df,
            company_objective=company_objective,
            use_custom_objective=use_custom_objective
        )
        
        # Step 2: Summarize relevant articles
        logger.info("Step 2: Summarizing relevant articles...")
        summarization_service = SummarizationService()
        
        combined_results = summarization_service.summarize_relevant_articles(
            classification_results=classification_results,
            max_sentences=max_sentences,
            domain=domain
        )
        
        logger.info("Classification and summarization completed successfully")
        
        # Prepare response
        response_data = {
            'total_articles': len(df),
            'classification_and_summarization_results': combined_results,
            'company_objective': company_objective,
            'parameters': {
                'max_sentences': max_sentences,
                'domain': domain,
                'use_custom_objective': use_custom_objective
            },
            'file_info': {
                'filename': file.filename,
                'articles_count': len(df)
            }
        }
        
        return APIResponse(
            success=True,
            message=f"Successfully classified and summarized {len(df)} articles",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification and summarization failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Classification and summarization failed: {str(e)}"
        )


@router.get(
    "/summarization-info",
    summary="Get Summarization Service Information",
    description="Get information about the summarization service and its capabilities",
    response_description="Summarization info retrieved successfully"
)
async def get_summarization_info():
    """
    Get summarization service information.
    
    **Returns:**
    - Summarization techniques used
    - Available domains
    - Service capabilities
    - Configuration
    """
    try:
        logger.info("Fetching summarization service information...")
        
        summarization_info = {
            'service_name': 'Enhanced Summarization Service',
            'techniques': [
                'Extractive Summarization',
                'TF-IDF Sentence Ranking',
                'Named Entity Recognition',
                'Numerical Data Prioritization',
                'Domain-Specific Keywords'
            ],
            'available_domains': [
                'general',
                'business',
                'technology',
                'finance'
            ],
            'features': {
                'sentence_ranking': True,
                'entity_recognition': True,
                'keyword_optimization': True,
                'numerical_prioritization': True,
                'custom_max_sentences': True
            },
            'default_parameters': {
                'max_sentences': 3,
                'domain': 'general'
            },
            'supported_formats': [
                'CSV upload',
                'Direct text input',
                'Combined with classification'
            ],
            'integration': {
                'standalone_summarization': True,
                'combined_with_classification': True,
                'batch_processing': True
            }
        }
        
        return APIResponse(
            success=True,
            message="Summarization service information retrieved successfully",
            data=summarization_info
        )
        
    except Exception as e:
        logger.error(f"Failed to get summarization info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get summarization info: {str(e)}"
        )
