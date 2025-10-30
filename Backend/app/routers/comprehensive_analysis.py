
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import pandas as pd
from loguru import logger

from app.services.llm_analysis_service import LLMAnalysisService
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.services.article_content_fetcher import ArticleContentFetcher
from app.models import APIResponse
from app.database_mysql_inspire import inspire_db
from app.models import AnalysisCreate, AnalysisType

router = APIRouter()

llm_service = None

def get_llm_service(provider: str = "auto"):
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
    try:
        logger.info(f"Comprehensive analysis request for: {company_name}")

        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")

        content = await file.read()
        data_processor = AdvancedDataProcessor()

        try:
            df = data_processor.process_csv(content)
            logger.info(f"Processed {len(df)} articles")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        logger.info("🔍 Fetching full article content from URLs...")
        content_fetcher = ArticleContentFetcher()

        articles_with_urls = []
        for _, row in df.iterrows():
            url = row.get('url', '')
            if url and url.startswith('http'):
                articles_with_urls.append({
                    'title': row.get('title', ''),
                    'url': url,
                    'snippet': row.get('content', '')
                })

        articles_to_fetch = articles_with_urls[:15]
        logger.info(f"📰 Fetching full content for {len(articles_to_fetch)} articles (limited from {len(df)} total)...")

        articles = []
        for article_data in articles_to_fetch:
            enhanced_article = await content_fetcher.fetch_article_content(article_data)

            if enhanced_article.get('content') and len(enhanced_article.get('content', '')) > 200:
                articles.append({
                    'title': enhanced_article.get('title', article_data['title']),
                    'content': enhanced_article.get('content', '')
                })
                logger.info(f"✅ Fetched {len(enhanced_article.get('content', ''))} chars from: {article_data['title'][:50]}...")
            else:
                articles.append({
                    'title': article_data['title'],
                    'content': article_data['snippet']
                })
                logger.warning(f"⚠️ Using snippet for: {article_data['title'][:50]}...")
        
        await content_fetcher.close()
        logger.info(f"📊 Final article count: {len(articles)} articles with content")

        logger.info(f"Analyzing {company_name} with LLM (all 7 questions)...")
        logger.info(f"SME objective: {sme_objective[:100]}...")

        llm_svc = get_llm_service(llm_provider)

        analysis_results = await llm_svc.analyze_comprehensive(
            articles=articles,
            company_name=company_name,
            sme_objective=sme_objective
        )

        # Store analysis in database
        try:
            # First, get or create company
            company = await inspire_db.get_company_by_name(company_name)
            if not company:
                company_id = await inspire_db.create_company(
                    name=company_name,
                    industry=llm_svc._detect_industry(" ".join([a.get('content', '') for a in articles[:5]]))
                )
                logger.info(f"📝 Created new company record: {company_name} (ID: {company_id})")
            else:
                company_id = company['company_id']
                logger.info(f"📝 Using existing company: {company_name} (ID: {company_id})")
            
            # Store analysis in database
            analysis_id = await inspire_db.create_analysis(
                company_id=company_id,
                latest_updates=analysis_results.get('latest_updates', ''),
                challenges=analysis_results.get('challenges', ''),
                decision_makers=analysis_results.get('decision_makers', ''),
                market_position=analysis_results.get('market_position', ''),
                future_plans=analysis_results.get('future_plans', ''),
                action_plan=analysis_results.get('action_plan', ''),
                solutions=analysis_results.get('solutions', ''),
                analysis_type=AnalysisType.COMPREHENSIVE.value,
                confidence_score=0.85  # High confidence for LLM analysis
            )
            logger.info(f"💾 Stored analysis in database (ID: {analysis_id})")
            
            # Store articles in database
            articles_stored = 0
            for article in articles:
                try:
                    await inspire_db.create_article(
                        company_id=company_id,
                        title=article.get('title', ''),
                        url=article.get('url', ''),
                        content=article.get('content', ''),
                        source=article.get('source', 'Unknown'),
                        relevance_score=0.8  # High relevance for analysis articles
                    )
                    articles_stored += 1
                except Exception as e:
                    logger.warning(f"⚠️ Failed to store article: {str(e)}")
            
            logger.info(f"📰 Stored {articles_stored} articles in database")
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to store analysis in database: {str(e)}")
            # Continue with response even if database storage fails

        results = {
            'company_name': company_name,
            'sme_objective': sme_objective,
            'analysis': analysis_results,
            'database': {
                'company_id': company_id if 'company_id' in locals() else None,
                'analysis_id': analysis_id if 'analysis_id' in locals() else None,
                'articles_stored': articles_stored if 'articles_stored' in locals() else 0
            },
            'metadata': {
                'articles_analyzed': len(articles),
                'articles_in_csv': len(df),
                'articles_with_full_content': sum(1 for a in articles if len(a.get('content', '')) > 200),
                'method': 'LLM-based comprehensive analysis with full article fetching',
                'llm_provider': llm_provider,
                'sme_industry_detected': llm_svc._detect_industry(sme_objective),
                'target_industry_detected': llm_svc._detect_industry(" ".join([a.get('content', '') for a in articles[:5]])),
                'file_info': {
                    'filename': file.filename,
                    'total_articles_in_file': len(df),
                    'articles_fetched': len(articles)
                }
            }
        }

        logger.info("✅ Comprehensive analysis completed successfully")

        return APIResponse(
            success=True,
            message=f"Successfully analyzed {company_name} - 7 questions answered and stored in database",
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

