"""Comprehensive Company Analysis Router.

Provides endpoints for extracting answers to all 7 business intelligence questions
using hybrid QA + LLM approach.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import pandas as pd
from loguru import logger

from app.services.llm_analysis_service import LLMAnalysisService
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.models import APIResponse

router = APIRouter()

# Initialize services
llm_service = None

def get_llm_service(provider: str = "auto"):
    """Lazy initialize LLM analysis service."""
    global llm_service
    if llm_service is None:
        llm_service = LLMAnalysisService(llm_provider=provider)
    return llm_service


@router.post(
    "/analyze",
    summary="Comprehensive Company Analysis (7 Questions)",
    description="""
    **Comprehensive analysis answering 7 key business intelligence questions.**
    
    Upload a CSV with articles about a company and get detailed answers to:
    
    1. **LATEST UPDATES**: Leadership changes, financial health, strategic moves
    2. **CHALLENGES**: Biggest challenges, priorities, inefficiencies
    3. **DECISION MAKERS**: Key people shaping company direction
    4. **MARKET POSITION**: Competitive positioning and market trends
    5. **FUTURE PLANS**: Upcoming initiatives, partnerships, expansions
    6. **ACTION PLAN**: 3 steps to engage this client (AI-generated)
    7. **SOLUTIONS**: 3 relevant SME solutions (AI-generated)
    
    **CSV Format:**
    - Required columns: `title`, `content`
    - All articles should be about the same company
    
    **Technology:**
    - Questions 1-7: LLM-based analysis (works with short snippets)
    - Adaptive prompts based on SME and target industries
    - Multi-provider support (Ollama free, OpenAI paid, template fallback)
    """,
    response_description="Comprehensive analysis completed successfully"
)
async def comprehensive_company_analysis(
    file: UploadFile = File(..., description="CSV file containing articles about the company"),
    company_name: str = Form(..., description="Name of the company being analyzed"),
    sme_objective: str = Form(..., description="YOUR SME's objectives, capabilities, and what you offer"),
    llm_provider: str = Form("auto", description="LLM provider: 'ollama' (free), 'openai' (paid), or 'auto'")
):
    """
    Analyze company articles and answer all 7 business intelligence questions.
    
    **Request:**
    - file: CSV with articles (columns: title, content)
    - company_name: Company being analyzed
    - sme_objective: YOUR SME's objectives and capabilities (what YOU offer)
    - llm_provider: Which LLM to use for synthesis questions
    
    **Returns:**
    - Answers to all 7 questions
    - Metadata about extraction process
    - Model information
    
    **Example:**
    ```
    company_name: MTN Rwanda
    sme_objective: We provide mobile payment solutions for SMEs in Africa, 
                   including QR code payments, merchant management platforms, 
                   and cross-border payment processing.
    ```
    """
    try:
        logger.info(f"Comprehensive analysis request for: {company_name}")
        
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")
        
        # Read and process CSV
        content = await file.read()
        data_processor = AdvancedDataProcessor()
        
        try:
            df = data_processor.process_csv(content)
            logger.info(f"Processed {len(df)} articles")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Convert to article list
        articles = []
        for _, row in df.iterrows():
            articles.append({
                'title': row.get('title', ''),
                'content': row.get('content', '')
            })
        
        # Analyze using LLM for ALL 7 questions
        logger.info(f"Analyzing {company_name} with LLM (all 7 questions)...")
        logger.info(f"SME objective: {sme_objective[:100]}...")
        
        llm_svc = get_llm_service(llm_provider)
        
        analysis_results = await llm_svc.analyze_comprehensive(
            articles=articles,
            company_name=company_name,
            sme_objective=sme_objective
        )
        
        # Compile final results
        results = {
            'company_name': company_name,
            'sme_objective': sme_objective,
            'analysis': analysis_results,
            'metadata': {
                'articles_analyzed': len(articles),
                'method': 'LLM-based comprehensive analysis',
                'llm_provider': llm_provider,
                'sme_industry_detected': llm_svc._detect_industry(sme_objective),
                'target_industry_detected': llm_svc._detect_industry(" ".join([a.get('content', '') for a in articles[:5]])),
                'file_info': {
                    'filename': file.filename,
                    'articles_count': len(articles)
                }
            }
        }
        
        logger.info("✅ Comprehensive analysis completed successfully")
        
        return APIResponse(
            success=True,
            message=f"Successfully analyzed {company_name} - 7 questions answered",
            data=results
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Comprehensive analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get(
    "/info",
    summary="Get Comprehensive Analysis Service Information",
    description="Get information about the comprehensive analysis service and its capabilities"
)
async def get_analysis_info():
    """
    Get information about the comprehensive analysis service.
    
    Returns:
    - Service capabilities
    - Model information
    - Question templates
    - Requirements
    """
    llm_svc = get_llm_service()
    
    return APIResponse(
        success=True,
        message="Comprehensive analysis service information",
        data={
            'service_name': 'Comprehensive Company Analysis (LLM-Powered)',
            'version': '2.0.0',
            'description': 'AI-powered business intelligence analysis answering 7 key questions using adaptive LLM prompts',
            'questions': {
                '1': 'LATEST UPDATES: Leadership changes, financial health, strategic moves',
                '2': 'CHALLENGES: Biggest challenges, priorities, inefficiencies',
                '3': 'DECISION MAKERS: Key people shaping company direction',
                '4': 'MARKET POSITION: Competitive positioning and market trends',
                '5': 'FUTURE PLANS: Upcoming initiatives, partnerships, expansions',
                '6': 'ACTION PLAN: SME-specific steps to engage client (industry-adapted)',
                '7': 'SOLUTIONS: YOUR SME solutions matched to THEIR needs (industry-adapted)'
            },
            'technology': {
                'method': 'LLM-based comprehensive analysis',
                'all_questions': 'Single LLM call for all 7 questions',
                'providers': ['Ollama/Llama3.1 (free, local)', 'OpenAI/GPT-3.5 (paid API)', 'Template-based (fallback)'],
                'works_with': 'Short snippets (like CSV exports) or full articles'
            },
            'adaptive_features': {
                'industry_detection': '8 industries supported',
                'context_generation': 'Industry-pair synergy mapping',
                'prompt_adaptation': 'Terminology and examples adapt to industries',
                'sme_integration': 'Recommendations based on YOUR SME capabilities'
            },
            'your_contributions': [
                'Adaptive prompt engineering (industry-aware)',
                'Industry detection algorithm (8 industries, 50+ keywords)',
                'Industry-pair context mapping',
                'SME-objective integration',
                'Multi-article context aggregation',
                'Structured output parsing',
                'Multi-LLM provider support',
                'Template-based fallback system'
            ],
            'requirements': {
                'recommended': 'Ollama (free) OR OpenAI API key (paid)',
                'optional': 'None - template fallback always works',
                'works_without_setup': 'Yes (template-based answers)'
            },
            'endpoints': {
                'analyze': '/api/v1/analysis/analyze',
                'info': '/api/v1/analysis/info'
            },
            'example_usage': {
                'company_name': 'MTN Rwanda',
                'sme_objective': 'We provide mobile payment solutions for SMEs in Africa',
                'expected_output': '7 detailed answers with industry-specific recommendations'
            }
        }
    )

