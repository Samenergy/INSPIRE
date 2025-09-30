"""Router for article classification endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger

from app.models import ArticleClassificationRequest, ArticleClassificationResponse
from app.services.article_classification_service import ArticleClassificationService
from app.services.transformer_classification_service import TransformerClassificationService

router = APIRouter()


@router.post(
    "/classify-articles-simple",
    summary="Simple Article Classification Test",
    description="Simple test endpoint for article classification."
)
async def classify_articles_simple(request: ArticleClassificationRequest):
    """Simple classification endpoint for testing."""
    try:
        # Test basic functionality first
        from pathlib import Path
        
        exports_dir = Path("exports")
        csv_files = list(exports_dir.glob("*.csv"))
        
        return {
            "success": True,
            "message": "Simple test successful",
            "data": {
                "company_name": request.company_name,
                "objectives": request.company_objectives,
                "csv_filename": request.csv_filename,
                "available_csvs": [f.name for f in csv_files]
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Simple test failed: {str(e)}",
            "data": None
        }


@router.post(
    "/classify-articles",
    summary="Classify Articles Using Transformers (Recommended)",
    description="""
    Classify articles from CSV files using transformer-based semantic similarity analysis.
    
    This endpoint uses state-of-the-art transformer models to:
    1. Load articles from CSV files in the exports directory
    2. Calculate semantic similarity between articles and company objectives
    3. Combine semantic analysis with keyword matching for accurate classification
    4. Generate a filtered CSV with only relevant articles
    5. Return detailed classification results with reasoning
    
    **Features:**
    - Uses DistilBERT and Sentence Transformers for semantic understanding
    - Combines semantic similarity (70%) with keyword matching (30%)
    - Provides detailed reasoning for each classification decision
    - Higher accuracy than traditional ML approaches
    
    **Input (all required):**
    - company_name: Name of the company
    - company_objectives: Detailed description of company goals and objectives
    - csv_filename: Name of the CSV file (located in exports/) to process
    
    **Output:**
    - Total number of articles processed
    - Number of relevant/irrelevant articles
    - Relevance percentage
    - Path to filtered CSV file
    - Detailed classification results with semantic similarity scores
    """,
    response_description="Transformer-based article classification completed successfully"
)
async def classify_articles(
    request: ArticleClassificationRequest
):
    """
    Classify articles based on company objectives.
    
    This endpoint uses machine learning to automatically classify articles
    from CSV files as relevant or irrelevant to a company's objectives.
    
    **Workflow:**
    1. **Data Loading**: Loads articles from CSV files in exports directory
    2. **Training Data Preparation**: Creates training data based on company name and objectives
    3. **Model Training**: Trains a Naive Bayes classifier with TF-IDF vectorization
    4. **Classification**: Classifies all articles using the trained model
    5. **CSV Generation**: Creates a filtered CSV with only relevant articles
    6. **Results**: Returns detailed classification statistics and results
    
    **Example Request:**
    ```json
    {
        "company_name": "Mastercard",
        "company_objectives": "Financial technology, digital payments, credit cards, financial inclusion, payment processing, fintech innovation",
        "csv_filename": "mastercard_news_articles_20250929_183923.csv"
    }
    ```
    
    **Example Response:**
    ```json
    {
        "success": true,
        "message": "Successfully classified 150 articles. 45 relevant articles found.",
        "data": {
            "total_articles": 150,
            "relevant_articles": 45,
            "irrelevant_articles": 105,
            "relevance_score": 30.0,
            "filtered_csv_path": "exports/mastercard_relevant_articles_20250929_184530.csv",
            "classification_details": [...]
        }
    }
    ```
    """
    try:
        logger.info(f"Starting article classification for company: {request.company_name}")
        
        # Validate request
        if not request.company_name.strip():
            raise HTTPException(status_code=400, detail="Company name cannot be empty")
        
        if not request.company_objectives.strip():
            raise HTTPException(status_code=400, detail="Company objectives cannot be empty")
        
        # Validate CSV file exists
        from pathlib import Path
        csv_path = Path("exports") / request.csv_filename
        if not csv_path.exists():
            raise HTTPException(status_code=400, detail=f"CSV file not found: {request.csv_filename}")
        
        logger.info("Request validation passed")
        
        # Create transformer-based service instance
        service = TransformerClassificationService()
        logger.info("Transformer service created successfully")
        
        # Perform classification
        logger.info("Starting classification...")
        result = service.classify_articles(request)
        logger.info("Classification completed")
        
        if not result.success:
            logger.error(f"Classification failed: {result.message}")
            raise HTTPException(status_code=500, detail=result.message)
        
        logger.info(f"Classification completed: {result.data.relevant_articles}/{result.data.total_articles} articles relevant")
        
        # Return a simple response for testing
        return {
            "success": result.success,
            "message": result.message,
            "data": {
                "total_articles": result.data.total_articles,
                "relevant_articles": result.data.relevant_articles,
                "irrelevant_articles": result.data.irrelevant_articles,
                "relevance_score": result.data.relevance_score,
                "filtered_csv_path": result.data.filtered_csv_path
            } if result.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in article classification: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post(
    "/classify-articles-traditional",
    summary="Classify Articles Using Traditional ML",
    description="""
    Classify articles from CSV files using traditional machine learning (Naive Bayes + TF-IDF).
    
    This endpoint uses traditional ML approaches for faster processing:
    1. Loads articles from CSV files in the exports directory
    2. Trains a Naive Bayes classifier with TF-IDF vectorization
    3. Classifies articles based on keyword matching and statistical analysis
    4. Generates a filtered CSV with only relevant articles
    5. Returns classification results and statistics
    
    **Use this endpoint when:**
    - You need faster processing for large datasets
    - You have limited computational resources
    - You prefer traditional ML approaches
    
    **Input (all required):**
    - company_name: Name of the company
    - company_objectives: Detailed description of company goals and objectives
    - csv_filename: Name of the CSV file (located in exports/) to process
    
    **Output:**
    - Total number of articles processed
    - Number of relevant/irrelevant articles
    - Relevance percentage
    - Path to filtered CSV file
    - Detailed classification results
    """,
    response_description="Traditional ML article classification completed successfully"
)
async def classify_articles_traditional(
    request: ArticleClassificationRequest
):
    """
    Classify articles using traditional machine learning approach.
    
    This endpoint uses Naive Bayes classifier with TF-IDF vectorization
    for faster processing of large datasets.
    """
    try:
        logger.info(f"Starting traditional ML classification for company: {request.company_name}")
        
        # Validate request
        if not request.company_name.strip():
            raise HTTPException(status_code=400, detail="Company name cannot be empty")
        
        if not request.company_objectives.strip():
            raise HTTPException(status_code=400, detail="Company objectives cannot be empty")
        
        # Validate CSV file exists
        from pathlib import Path
        csv_path = Path("exports") / request.csv_filename
        if not csv_path.exists():
            raise HTTPException(status_code=400, detail=f"CSV file not found: {request.csv_filename}")
        
        logger.info("Request validation passed")
        
        # Create traditional ML service instance
        service = ArticleClassificationService()
        logger.info("Traditional ML service created successfully")
        
        # Perform classification
        logger.info("Starting traditional classification...")
        result = service.classify_articles(request)
        logger.info("Classification completed")
        
        if not result.success:
            logger.error(f"Classification failed: {result.message}")
            raise HTTPException(status_code=500, detail=result.message)
        
        logger.info(f"Classification completed: {result.data.relevant_articles}/{result.data.total_articles} articles relevant")
        
        # Return a simple response for testing
        return {
            "success": result.success,
            "message": result.message,
            "data": {
                "total_articles": result.data.total_articles,
                "relevant_articles": result.data.relevant_articles,
                "irrelevant_articles": result.data.irrelevant_articles,
                "relevance_score": result.data.relevance_score,
                "filtered_csv_path": result.data.filtered_csv_path,
                "method": "traditional_ml"
            } if result.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in traditional article classification: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/classification-test",
    summary="Test Classification Service",
    description="Simple test endpoint to verify the classification service works."
)
async def test_classification_service():
    """Simple test endpoint."""
    try:
        from pathlib import Path
        
        # Test basic functionality
        exports_dir = Path("exports")
        csv_files = list(exports_dir.glob("*.csv"))
        
        return {
            "success": True,
            "message": "Classification service test successful",
            "data": {
                "exports_dir_exists": exports_dir.exists(),
                "csv_files_count": len(csv_files),
                "csv_files": [f.name for f in csv_files]
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Test failed: {str(e)}",
            "data": None
        }


@router.get(
    "/classification-status",
    summary="Get Classification Status",
    description="Get information about available CSV files and trained models."
)
async def get_classification_status():
    """
    Get status information about available CSV files and trained models.
    
    Returns information about:
    - Available CSV files in exports directory
    - Trained classification models
    - Last classification results
    """
    try:
        from pathlib import Path
        
        exports_dir = Path("exports")
        models_dir = Path("models")
        
        # Get available CSV files
        csv_files = []
        if exports_dir.exists():
            csv_files = [f.name for f in exports_dir.glob("*.csv")]
        
        # Get trained models
        trained_models = []
        if models_dir.exists():
            trained_models = [f.name for f in models_dir.glob("*.joblib")]
        
        return {
            "success": True,
            "message": "Classification status retrieved successfully",
            "data": {
                "available_csv_files": csv_files,
                "trained_models": trained_models,
                "exports_directory": str(exports_dir.absolute()),
                "models_directory": str(models_dir.absolute())
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting classification status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")
