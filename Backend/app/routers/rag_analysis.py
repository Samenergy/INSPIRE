"""
RAG-based Analysis Router
Replaces hybrid analysis with Retrieval-Augmented Generation approach
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import pandas as pd
from loguru import logger

from app.services.rag_analysis_service import RAGAnalysisService
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.services.article_content_fetcher import ArticleContentFetcher
from app.models import APIResponse
from app.config import settings

router = APIRouter()

# Global RAG service instance
rag_service = None


def get_rag_service():
    """Get or create RAG service instance"""
    global rag_service
    if rag_service is None:
        rag_service = RAGAnalysisService(
            milvus_host=getattr(settings, 'milvus_host', 'localhost'),
            milvus_port=getattr(settings, 'milvus_port', '19530'),
            ollama_host=getattr(settings, 'ollama_base_url', 'http://localhost:11434'),
            llm_model=getattr(settings, 'ollama_model', 'llama3')
        )
    return rag_service


@router.post(
    "/analyze",
    summary="RAG-based Company Analysis",
    description="""
    **🎓 ADVANCED: Retrieval-Augmented Generation (RAG) System**
    
    This endpoint uses a state-of-the-art RAG pipeline for company analysis:
    
    **Architecture:**
    1. **Text Chunking**: Splits articles into semantic chunks with overlap
    2. **Embedding**: Converts chunks to vectors using SentenceTransformer
    3. **Vector Storage**: Stores in Milvus vector database (or in-memory fallback)
    4. **Retrieval**: Queries top-k relevant chunks for each category
    5. **Generation**: Uses Llama-3 with structured prompts to extract JSON
    6. **Enhancement**: Optimized temperature, max tokens, and prompt engineering
    
    **Extracted Categories (10 total):**
    1. Latest Updates (product launches, financial results, partnerships)
    2. Challenges (competitive pressures, operational difficulties)
    3. Decision Makers (executives, leaders with roles)
    4. Market Position (competitors, advantages, market share)
    5. Future Plans (expansion, investments, strategic initiatives)
    6. Action Plan (3 steps for SME to engage with the company)
    7. Solution (3 relevant SME solutions for the company's needs)
    8. Company Info (5-sentence company description)
    9. Strengths (key competitive advantages)
    10. Opportunities (potential growth areas)
    
    **CSV Format:**
    - Required columns: `title`, `content` (and optionally `url`)
    - If URLs provided, fetches full article content
    
    **Technology Stack:**
    - **Embeddings:** SentenceTransformer (all-MiniLM-L6-v2)
    - **Vector DB:** Milvus (with in-memory fallback)
    - **LLM:** Llama-3 via Ollama
    - **Retrieval:** Cosine similarity search
    
    **Improvements over Base Model:**
    - Optimized prompts for each category
    - Temperature tuning (0.3 for factual extraction)
    - Top-k retrieval (5 most relevant chunks)
    - JSON-structured output with validation
    - Chunk overlap for context preservation
    """,
    response_description="RAG analysis completed with structured JSON output"
)
async def rag_company_analysis(
    file: UploadFile = File(..., description="CSV file containing articles about the company"),
    company_name: str = Form(..., description="Name of the company being analyzed"),
    sme_objective: str = Form("", description="Your SME's objectives and capabilities (optional)"),
    fetch_full_content: bool = Form(True, description="Fetch full article content from URLs (recommended)"),
    temperature: Optional[float] = Form(None, description="LLM temperature (default: 0.3)"),
    top_k: Optional[int] = Form(None, description="Number of chunks to retrieve (default: 5)")
):
    """
    Perform RAG-based company analysis
    """
    try:
        logger.info(f"🎯 RAG analysis request for: {company_name}")
        
        # Validate file
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")
        
        # Process CSV
        content = await file.read()
        data_processor = AdvancedDataProcessor()
        
        try:
            df = data_processor.process_csv(content)
            logger.info(f"📊 Processed {len(df)} articles from CSV")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Fetch full content if requested
        articles = []
        
        if fetch_full_content and 'url' in df.columns:
            logger.info("🔍 Fetching full article content from URLs...")
            content_fetcher = ArticleContentFetcher()
            
            articles_with_urls = []
            for _, row in df.iterrows():
                url = str(row.get('url', ''))
                title = str(row.get('title', ''))
                content = str(row.get('content', ''))
                
                if url and url.startswith('http'):
                    articles_with_urls.append({
                        'title': title,
                        'url': url,
                        'snippet': content
                    })
            
            # Fetch up to 20 articles
            articles_to_fetch = articles_with_urls[:20]
            logger.info(f"📰 Fetching full content for {len(articles_to_fetch)} articles...")
            
            for article_data in articles_to_fetch:
                article_dict = {
                    'url': article_data['url'],
                    'title': article_data['title'],
                    'content': article_data['snippet']
                }
                
                enhanced_article = await content_fetcher.fetch_article_content(article_dict)
                
                articles.append({
                    'title': str(enhanced_article.get('title', '')),
                    'content': str(enhanced_article.get('content', ''))
                })
            
            logger.info(f"✅ {len(articles)} articles ready for RAG analysis")
        else:
            # Use CSV content directly
            for _, row in df.iterrows():
                articles.append({
                    'title': str(row.get('title', '')),
                    'content': str(row.get('content', ''))
                })
        
        # Validate articles
        validated_articles = []
        for article in articles:
            if isinstance(article, dict) and article.get('content'):
                if len(article['content']) >= 50:  # Minimum content length
                    validated_articles.append({
                        'title': str(article.get('title', '')),
                        'content': str(article.get('content', ''))
                    })
        
        if not validated_articles:
            raise HTTPException(status_code=400, detail="No valid articles found in CSV")
        
        logger.info(f"✅ Validated {len(validated_articles)} articles")
        
        # Initialize RAG service
        rag_svc = get_rag_service()
        
        # Update hyperparameters if provided
        if temperature is not None:
            rag_svc.hyperparameters['temperature'] = temperature
        if top_k is not None:
            rag_svc.hyperparameters['top_k'] = top_k
        
        # Perform RAG analysis
        logger.info(f"🚀 Starting RAG analysis...")
        
        analysis_result = rag_svc.analyze_comprehensive(
            articles=validated_articles,
            company_name=company_name,
            sme_objective=sme_objective
        )
        
        # Format response
        results = {
            'company_name': company_name,
            'sme_objective': sme_objective,
            'analysis': analysis_result['analysis'],
            'metadata': {
                **analysis_result['metadata'],
                'file_info': {
                    'filename': file.filename,
                    'total_articles_in_csv': len(df),
                    'articles_analyzed': len(validated_articles)
                }
            },
            'rag_pipeline': {
                'description': 'Retrieval-Augmented Generation for company intelligence',
                'steps': [
                    '1. Text Chunking (500 chars, 100 overlap)',
                    '2. Embedding (SentenceTransformer)',
                    '3. Vector Storage (Milvus or in-memory)',
                    '4. Retrieval (Top-k cosine similarity)',
                    '5. Generation (Llama-3 with structured prompts)',
                    '6. JSON Parsing and Validation'
                ],
                'improvements': [
                    'Optimized prompts for each category',
                    'Temperature tuning (0.3 for factual extraction)',
                    'Top-k retrieval (5 most relevant chunks)',
                    'JSON-structured output',
                    'Chunk overlap for context',
                    'Cosine similarity for better retrieval'
                ]
            }
        }
        
        logger.info("✅ RAG analysis completed successfully")
        
        return APIResponse(
            success=True,
            message=f"Successfully analyzed {company_name} using RAG pipeline - 10 categories extracted",
            data=results
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f"RAG analysis failed: {e}")
        logger.error(f"Full traceback:\n{error_traceback}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get(
    "/info",
    summary="Get RAG Analysis Service Information",
    description="Get information about the RAG analysis service and its architecture"
)
async def get_rag_info():
    """Get RAG service information"""
    return APIResponse(
        success=True,
        message="RAG analysis service information",
        data={
            'service_name': 'RAG-based Company Analysis',
            'version': '2.0.0',
            'description': 'Retrieval-Augmented Generation system for extracting company intelligence from articles',
            'architecture': {
                'step_1': {
                    'name': 'Text Chunking',
                    'description': 'Split articles into semantic chunks with overlap',
                    'parameters': {
                        'chunk_size': 500,
                        'overlap': 100
                    }
                },
                'step_2': {
                    'name': 'Embedding',
                    'description': 'Convert text chunks to dense vectors',
                    'model': 'all-MiniLM-L6-v2 (SentenceTransformer)',
                    'dimension': 384
                },
                'step_3': {
                    'name': 'Vector Storage',
                    'description': 'Store embeddings in vector database',
                    'primary': 'Milvus (distributed vector DB)',
                    'fallback': 'In-memory NumPy arrays'
                },
                'step_4': {
                    'name': 'Retrieval',
                    'description': 'Query relevant chunks using cosine similarity',
                    'parameters': {
                        'top_k': 5,
                        'metric': 'cosine similarity'
                    }
                },
                'step_5': {
                    'name': 'Generation',
                    'description': 'Extract structured information using LLM',
                    'model': 'Llama-3 (via Ollama)',
                    'parameters': {
                        'temperature': 0.3,
                        'max_tokens': 800
                    }
                },
                'step_6': {
                    'name': 'Validation',
                    'description': 'Parse and validate JSON output',
                    'format': 'Structured JSON with confidence scores'
                }
            },
            'categories_extracted': {
                '1_latest_updates': 'Product launches, financial results, partnerships, announcements',
                '2_challenges': 'Competitive pressures, operational difficulties, market challenges',
                '3_decision_makers': 'Executives, leaders, management with roles',
                '4_market_position': 'Competitors, market share, competitive advantages',
                '5_future_plans': 'Expansion plans, investments, strategic initiatives',
                '6_action_plan': '3 specific steps for SME to engage with the company',
                '7_solution': '3 relevant SME solutions that address company needs',
                '8_company_info': '5-sentence company description',
                '9_strengths': 'Key competitive advantages and positive aspects',
                '10_opportunities': 'Potential growth areas and market opportunities'
            },
            'improvements_over_base_model': [
                {
                    'improvement': 'Optimized Prompts',
                    'description': 'Category-specific prompts with clear instructions and examples',
                    'impact': 'Better extraction accuracy and JSON formatting'
                },
                {
                    'improvement': 'Temperature Tuning',
                    'description': 'Low temperature (0.3) for factual extraction',
                    'impact': 'More consistent and accurate results'
                },
                {
                    'improvement': 'Top-k Retrieval',
                    'description': 'Retrieve 5 most relevant chunks per query',
                    'impact': 'Better context without noise'
                },
                {
                    'improvement': 'Chunk Overlap',
                    'description': '100-character overlap between chunks',
                    'impact': 'Preserves context across boundaries'
                },
                {
                    'improvement': 'Structured Output',
                    'description': 'JSON schema enforcement with validation',
                    'impact': 'Consistent, parseable results'
                },
                {
                    'improvement': 'Semantic Retrieval',
                    'description': 'Cosine similarity on embeddings',
                    'impact': 'Finds relevant info even with different wording'
                }
            ],
            'technology_stack': {
                'embeddings': {
                    'model': 'all-MiniLM-L6-v2',
                    'library': 'sentence-transformers',
                    'dimension': 384,
                    'speed': 'Fast (CPU-friendly)'
                },
                'vector_database': {
                    'primary': 'Milvus',
                    'features': ['Distributed', 'Scalable', 'ACID transactions'],
                    'fallback': 'In-memory NumPy'
                },
                'llm': {
                    'model': 'Llama-3',
                    'provider': 'Ollama (local)',
                    'parameters': {
                        'temperature': 0.3,
                        'max_tokens': 800
                    }
                }
            },
            'requirements': {
                'core': ['sentence-transformers', 'numpy', 'requests'],
                'vector_db': ['pymilvus (optional, with fallback)'],
                'llm': ['Ollama with Llama-3 model installed'],
                'installation': {
                    'embeddings': 'pip install sentence-transformers',
                    'milvus': 'pip install pymilvus (optional)',
                    'ollama': 'curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3'
                }
            },
            'endpoints': {
                'analyze': '/api/v1/rag/analyze',
                'info': '/api/v1/rag/info'
            },
            'advantages_over_hybrid': [
                'Adapts to any dataset automatically',
                'Semantic retrieval finds relevant info even with different wording',
                'Structured JSON output is easier to parse',
                'Scalable to large document collections',
                'Single unified approach (no technique switching)',
                'Better handling of long documents via chunking'
            ]
        }
    )


@router.get(
    "/health",
    summary="Check RAG Service Health",
    description="Check if RAG service components are available"
)
async def check_rag_health():
    """Check RAG service health"""
    try:
        rag_svc = get_rag_service()
        
        # Check components
        health_status = {
            'embedding_model': 'available',
            'vector_storage': 'milvus' if rag_svc.milvus_available else 'in-memory',
            'llm': 'checking...'
        }
        
        # Test LLM connection
        try:
            import requests
            response = requests.get(f"{rag_svc.ollama_host}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                llama_available = any('llama3' in str(m.get('name', '')).lower() for m in models)
                health_status['llm'] = 'available (llama3)' if llama_available else 'ollama running, but llama3 not found'
            else:
                health_status['llm'] = 'ollama not responding'
        except Exception as e:
            health_status['llm'] = f'unavailable: {str(e)}'
        
        overall_status = 'healthy' if health_status['llm'].startswith('available') else 'degraded'
        
        return APIResponse(
            success=True,
            message=f"RAG service is {overall_status}",
            data=health_status
        )
    
    except Exception as e:
        return APIResponse(
            success=False,
            message="RAG service health check failed",
            data={'error': str(e)}
        )

