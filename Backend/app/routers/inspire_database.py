"""
INSPIRE Database API Router
Handles all database operations for SME, Company, Recommendation, Analysis, and Article entities
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import date, datetime
import logging
import json

from app.database_mysql_inspire import inspire_db
from app.models import (
    SMECreate, SME, CompanyCreateINSPIRE, CompanyINSPIRE, 
    RecommendationCreate, Recommendation, RecommendationWithDetails,
    AnalysisCreate, Analysis, AnalysisWithDetails,
    ArticleCreateINSPIRE, ArticleINSPIRE, ArticleWithDetails,
    DashboardStats, RecentActivity, INSPIREResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/inspire", tags=["INSPIRE Database"])

# SME Endpoints
@router.post("/smes", response_model=INSPIREResponse[SME])
async def create_sme(sme_data: SMECreate):
    """Create a new SME"""
    try:
        sme_id = await inspire_db.create_sme(
            name=sme_data.name,
            sector=sme_data.sector,
            objective=sme_data.objective,
            contact_email=sme_data.contact_email
        )
        
        sme = await inspire_db.get_sme(sme_id)
        return INSPIREResponse(
            success=True,
            message="SME created successfully",
            data=sme
        )
    except Exception as e:
        logger.error(f"Error creating SME: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating SME: {str(e)}")

@router.get("/smes", response_model=INSPIREResponse[List[SME]])
async def get_all_smes():
    """Get all SMEs"""
    try:
        smes = await inspire_db.get_all_smes()
        return INSPIREResponse(
            success=True,
            message="SMEs retrieved successfully",
            data=smes
        )
    except Exception as e:
        logger.error(f"Error retrieving SMEs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving SMEs: {str(e)}")

@router.get("/smes/{sme_id}", response_model=INSPIREResponse[SME])
async def get_sme(sme_id: int):
    """Get SME by ID"""
    try:
        sme = await inspire_db.get_sme(sme_id)
        if not sme:
            raise HTTPException(status_code=404, detail="SME not found")
        
        return INSPIREResponse(
            success=True,
            message="SME retrieved successfully",
            data=sme
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving SME: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving SME: {str(e)}")

# Company Endpoints
@router.post("/companies", response_model=INSPIREResponse[CompanyINSPIRE])
async def create_company(company_data: CompanyCreateINSPIRE):
    """Create a new company"""
    try:
        company_id = await inspire_db.create_company(
            name=company_data.name,
            location=company_data.location,
            description=company_data.description,
            industry=company_data.industry,
            website=company_data.website,
            sme_id=company_data.sme_id
        )
        
        company = await inspire_db.get_company(company_id)
        return INSPIREResponse(
            success=True,
            message="Company created successfully",
            data=company
        )
    except Exception as e:
        logger.error(f"Error creating company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating company: {str(e)}")

@router.get("/companies", response_model=INSPIREResponse[List[CompanyINSPIRE]])
async def get_all_companies(sme_id: Optional[int] = Query(None, description="Optional SME ID to filter companies")):
    """Get all companies, optionally filtered by SME ID"""
    try:
        companies = await inspire_db.get_all_companies(sme_id=sme_id)
        return INSPIREResponse(
            success=True,
            message="Companies retrieved successfully",
            data=companies
        )
    except Exception as e:
        logger.error(f"Error retrieving companies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving companies: {str(e)}")

@router.get("/companies/count/{sme_id}", response_model=INSPIREResponse[int])
async def count_sme_companies(sme_id: int):
    """Count companies for a specific SME"""
    try:
        count = await inspire_db.count_companies_for_sme(sme_id)
        return INSPIREResponse(
            success=True,
            message=f"Counted {count} companies for SME {sme_id}",
            data=count
        )
    except Exception as e:
        logger.error(f"Error counting companies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error counting companies: {str(e)}")

@router.get("/companies/sme/{sme_id}", response_model=INSPIREResponse[List[CompanyINSPIRE]])
async def get_companies_by_sme(sme_id: int):
    """Get all companies for a specific SME"""
    try:
        companies = await inspire_db.get_all_companies(sme_id=sme_id)
        return INSPIREResponse(
            success=True,
            message=f"Retrieved {len(companies)} companies for SME {sme_id}",
            data=companies
        )
    except Exception as e:
        logger.error(f"Error retrieving companies for SME: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving companies for SME: {str(e)}")

@router.get("/companies/{company_id}", response_model=INSPIREResponse[CompanyINSPIRE])
async def get_company(company_id: int):
    """Get company by ID"""
    try:
        company = await inspire_db.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        return INSPIREResponse(
            success=True,
            message="Company retrieved successfully",
            data=company
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving company: {str(e)}")

@router.get("/companies/search", response_model=INSPIREResponse[CompanyINSPIRE])
async def search_company_by_name(name: str = Query(..., description="Company name to search")):
    """Search company by name"""
    try:
        company = await inspire_db.get_company_by_name(name)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        return INSPIREResponse(
            success=True,
            message="Company found successfully",
            data=company
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching company: {str(e)}")

@router.put("/companies/{company_id}", response_model=INSPIREResponse[CompanyINSPIRE])
async def update_company(company_id: int, company_data: CompanyCreateINSPIRE):
    """Update company information"""
    try:
        # Check if company exists
        existing_company = await inspire_db.get_company(company_id)
        if not existing_company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Update company
        success = await inspire_db.update_company(
            company_id=company_id,
            name=company_data.name,
            location=company_data.location,
            description=company_data.description,
            industry=company_data.industry,
            website=company_data.website,
            sme_id=company_data.sme_id
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update company")
        
        # Get updated company
        updated_company = await inspire_db.get_company(company_id)
        
        return INSPIREResponse(
            success=True,
            message="Company updated successfully",
            data=updated_company
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating company: {str(e)}")

@router.delete("/companies/{company_id}", response_model=INSPIREResponse[dict])
async def delete_company(company_id: int):
    """Delete company"""
    try:
        # Check if company exists
        company = await inspire_db.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Delete company
        success = await inspire_db.delete_company(company_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete company")
        
        return INSPIREResponse(
            success=True,
            message="Company deleted successfully",
            data={"company_id": company_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting company: {str(e)}")

# Recommendation Endpoints
@router.post("/recommendations", response_model=INSPIREResponse[Recommendation])
async def create_recommendation(recommendation_data: RecommendationCreate):
    """Create a new recommendation"""
    try:
        rec_id = await inspire_db.create_recommendation(
            sme_id=recommendation_data.sme_id,
            company_id=recommendation_data.company_id,
            recommendation_text=recommendation_data.recommendation_text,
            confidence_score=recommendation_data.confidence_score,
            date_generated=recommendation_data.date_generated
        )
        
        # Get the created recommendation with details
        recommendations = await inspire_db.get_recommendations_for_sme(recommendation_data.sme_id)
        recommendation = next((r for r in recommendations if r['rec_id'] == rec_id), None)
        
        return INSPIREResponse(
            success=True,
            message="Recommendation created successfully",
            data=recommendation
        )
    except Exception as e:
        logger.error(f"Error creating recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating recommendation: {str(e)}")

@router.get("/recommendations/sme/{sme_id}", response_model=INSPIREResponse[List[RecommendationWithDetails]])
async def get_recommendations_for_sme(sme_id: int):
    """Get all recommendations for an SME"""
    try:
        recommendations = await inspire_db.get_recommendations_for_sme(sme_id)
        return INSPIREResponse(
            success=True,
            message="Recommendations retrieved successfully",
            data=recommendations
        )
    except Exception as e:
        logger.error(f"Error retrieving recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving recommendations: {str(e)}")

@router.get("/recommendations/company/{company_id}", response_model=INSPIREResponse[List[RecommendationWithDetails]])
async def get_recommendations_for_company(company_id: int):
    """Get all recommendations for a company"""
    try:
        recommendations = await inspire_db.get_recommendations_for_company(company_id)
        return INSPIREResponse(
            success=True,
            message="Recommendations retrieved successfully",
            data=recommendations
        )
    except Exception as e:
        logger.error(f"Error retrieving recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving recommendations: {str(e)}")

# Analysis Endpoints
@router.post("/analyses", response_model=INSPIREResponse[Analysis])
async def create_analysis(analysis_data: AnalysisCreate):
    """Create a new analysis"""
    try:
        analysis_id = await inspire_db.create_analysis(
            company_id=analysis_data.company_id,
            latest_updates=analysis_data.latest_updates,
            challenges=analysis_data.challenges,
            decision_makers=analysis_data.decision_makers,
            market_position=analysis_data.market_position,
            future_plans=analysis_data.future_plans,
            action_plan=analysis_data.action_plan,
            solutions=analysis_data.solutions,
            analysis_type=analysis_data.analysis_type.value,
            confidence_score=analysis_data.confidence_score,
            date_analyzed=analysis_data.date_analyzed
        )
        
        # Get the created analysis with details
        analyses = await inspire_db.get_analysis_for_company(analysis_data.company_id)
        analysis = next((a for a in analyses if a['analysis_id'] == analysis_id), None)
        
        return INSPIREResponse(
            success=True,
            message="Analysis created successfully",
            data=analysis
        )
    except Exception as e:
        logger.error(f"Error creating analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating analysis: {str(e)}")

@router.get("/analyses/company/{company_id}", response_model=INSPIREResponse[List[AnalysisWithDetails]])
async def get_analyses_for_company(company_id: int):
    """Get all analyses for a company"""
    try:
        analyses = await inspire_db.get_analysis_for_company(company_id)
        return INSPIREResponse(
            success=True,
            message="Analyses retrieved successfully",
            data=analyses
        )
    except Exception as e:
        logger.error(f"Error retrieving analyses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving analyses: {str(e)}")

# Article Endpoints
@router.post("/articles", response_model=INSPIREResponse[ArticleINSPIRE])
async def create_article(article_data: ArticleCreateINSPIRE):
    """Create a new article"""
    try:
        article_id = await inspire_db.create_article(
            company_id=article_data.company_id,
            title=article_data.title,
            url=article_data.url,
            content=article_data.content,
            source=article_data.source,
            published_date=article_data.published_date,
            relevance_score=article_data.relevance_score,
            classification=article_data.classification.value,
            sentiment=article_data.sentiment.value
        )
        
        # Get the created article with details
        articles = await inspire_db.get_articles_for_company(article_data.company_id)
        article = next((a for a in articles if a['article_id'] == article_id), None)
        
        return INSPIREResponse(
            success=True,
            message="Article created successfully",
            data=article
        )
    except Exception as e:
        logger.error(f"Error creating article: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating article: {str(e)}")

@router.get("/articles/company/{company_id}", response_model=INSPIREResponse[List[ArticleWithDetails]])
async def get_articles_for_company(
    company_id: int,
    limit: int = Query(50, ge=1, le=100, description="Maximum number of articles to return")
):
    """Get articles for a company"""
    try:
        articles = await inspire_db.get_articles_for_company(company_id, limit)
        return INSPIREResponse(
            success=True,
            message="Articles retrieved successfully",
            data=articles
        )
    except Exception as e:
        logger.error(f"Error retrieving articles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving articles: {str(e)}")

@router.get("/articles/classification/{classification}", response_model=INSPIREResponse[List[ArticleWithDetails]])
async def get_articles_by_classification(
    classification: str,
    limit: int = Query(50, ge=1, le=100, description="Maximum number of articles to return")
):
    """Get articles by classification"""
    try:
        articles = await inspire_db.get_articles_by_classification(classification, limit)
        return INSPIREResponse(
            success=True,
            message="Articles retrieved successfully",
            data=articles
        )
    except Exception as e:
        logger.error(f"Error retrieving articles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving articles: {str(e)}")

# Analysis Endpoints
@router.get("/companies/{company_id}/analysis", response_model=INSPIREResponse[Optional[Analysis]])
async def get_latest_analysis_for_company(company_id: int):
    """Get the latest analysis for a specific company"""
    try:
        analysis = await inspire_db.get_latest_analysis_for_company(company_id)
        if not analysis:
            # Return success with None data instead of 404
            return INSPIREResponse(
                success=True,
                message=f"No analysis found for company ID {company_id}",
                data=None
            )
        
        # Transform the data to match the Analysis model
        # Convert uppercase analysis_type to lowercase, and add confidence_score if missing
        transformed_analysis = {
            'analysis_id': analysis['analysis_id'],
            'company_id': analysis['company_id'],
            'latest_updates': analysis.get('latest_updates'),
            'challenges': analysis.get('challenges'),
            'decision_makers': analysis.get('decision_makers'),
            'market_position': analysis.get('market_position'),
            'future_plans': analysis.get('future_plans'),
            'action_plan': analysis.get('action_plan'),
            'solutions': analysis.get('solutions'),
            'analysis_type': analysis.get('analysis_type', 'COMPREHENSIVE').lower(),
            'confidence_score': analysis.get('confidence_score', 0.0),
            'date_analyzed': analysis.get('date_analyzed'),
            'created_at': analysis.get('created_at'),
            'updated_at': analysis.get('updated_at')
        }
        
        return INSPIREResponse(
            success=True,
            message="Analysis retrieved successfully",
            data=transformed_analysis
        )
    except Exception as e:
        logger.error(f"Error retrieving analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving analysis: {str(e)}")

@router.get("/companies/{company_id}/analysis/all", response_model=INSPIREResponse[List[Analysis]])
async def get_all_analyses_for_company(company_id: int):
    """Get all analyses for a specific company"""
    try:
        analyses = await inspire_db.get_analysis_for_company(company_id)
        
        # Transform each analysis to match the Analysis model
        transformed_analyses = []
        for analysis in analyses:
            transformed_analysis = {
                'analysis_id': analysis['analysis_id'],
                'company_id': analysis['company_id'],
                'latest_updates': analysis.get('latest_updates'),
                'challenges': analysis.get('challenges'),
                'decision_makers': analysis.get('decision_makers'),
                'market_position': analysis.get('market_position'),
                'future_plans': analysis.get('future_plans'),
                'action_plan': analysis.get('action_plan'),
                'solutions': analysis.get('solutions'),
                'analysis_type': analysis.get('analysis_type', 'COMPREHENSIVE').lower(),
                'confidence_score': analysis.get('confidence_score', 0.0),
                'date_analyzed': analysis.get('date_analyzed'),
                'created_at': analysis.get('created_at'),
                'updated_at': analysis.get('updated_at')
            }
            transformed_analyses.append(transformed_analysis)
        
        return INSPIREResponse(
            success=True,
            message="Analyses retrieved successfully",
            data=transformed_analyses
        )
    except Exception as e:
        logger.error(f"Error retrieving analyses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving analyses: {str(e)}")

# Article Endpoints
@router.get("/companies/{company_id}/articles", response_model=INSPIREResponse[dict])
async def get_articles_by_classification_for_company(
    company_id: int,
    classification: Optional[str] = Query(None, description="Filter by classification (Directly Relevant, Indirectly Useful, Not Relevant)")
):
    """Get all articles for a company, optionally filtered by classification"""
    try:
        if classification:
            articles = await inspire_db.get_articles_for_company_by_classification(company_id, classification, 100)
            return INSPIREResponse(
                success=True,
                message=f"Articles ({classification}) retrieved successfully",
                data={
                    'classification': classification,
                    'articles': articles,
                    'count': len(articles)
                }
            )
        else:
            # Get all articles grouped by classification
            articles = await inspire_db.get_all_articles_by_classification_for_company(company_id)
            total_count = len(articles['directly_relevant']) + len(articles['indirectly_useful']) + len(articles['not_relevant'])
            
            return INSPIREResponse(
                success=True,
                message="Articles retrieved successfully",
                data={
                    'articles': articles,
                    'count': {
                        'directly_relevant': len(articles['directly_relevant']),
                        'indirectly_useful': len(articles['indirectly_useful']),
                        'not_relevant': len(articles['not_relevant']),
                        'total': total_count
                    }
                }
            )
    except Exception as e:
        logger.error(f"Error retrieving articles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving articles: {str(e)}")

@router.get("/companies/{company_id}/articles/summary", response_model=INSPIREResponse[dict])
async def get_articles_summary_for_company(company_id: int):
    """Get article summary (counts by classification) for a company"""
    try:
        articles = await inspire_db.get_all_articles_by_classification_for_company(company_id)
        
        return INSPIREResponse(
            success=True,
            message="Article summary retrieved successfully",
            data={
                'count': {
                    'directly_relevant': len(articles['directly_relevant']),
                    'indirectly_useful': len(articles['indirectly_useful']),
                    'not_relevant': len(articles['not_relevant']),
                    'total': len(articles['directly_relevant']) + len(articles['indirectly_useful']) + len(articles['not_relevant'])
                }
            }
        )
    except Exception as e:
        logger.error(f"Error retrieving article summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving article summary: {str(e)}")

@router.get("/companies/{company_id}/intelligence", response_model=INSPIREResponse[dict])
async def get_company_intelligence(company_id: int):
    """
    Get company intelligence information (company_info, strengths, opportunities)
    
    Returns RAG-extracted intelligence data including:
    - Company Info: 5-sentence company description
    - Strengths: Key competitive advantages
    - Opportunities: Potential growth areas
    """
    try:
        company = await inspire_db.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Extract intelligence fields
        company_info = company.get('company_info', '')
        strengths = company.get('strengths', '')
        opportunities = company.get('opportunities', '')
        
        # Parse JSON strings if they exist
        company_info_data = {}
        strengths_data = {}
        opportunities_data = {}
        
        if company_info:
            try:
                company_info_data = json.loads(company_info) if company_info else {}
            except (json.JSONDecodeError, TypeError):
                company_info_data = {'raw': company_info}
        
        if strengths:
            try:
                strengths_data = json.loads(strengths) if strengths else {}
            except (json.JSONDecodeError, TypeError):
                strengths_data = {'raw': strengths}
        
        if opportunities:
            try:
                opportunities_data = json.loads(opportunities) if opportunities else {}
            except (json.JSONDecodeError, TypeError):
                opportunities_data = {'raw': opportunities}
        
        return INSPIREResponse(
            success=True,
            message="Company intelligence retrieved successfully",
            data={
                'company_id': company_id,
                'company_name': company.get('name', ''),
                'company_info': company_info_data,
                'strengths': strengths_data,
                'opportunities': opportunities_data,
                'last_updated': company.get('updated_at')
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving company intelligence: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving company intelligence: {str(e)}")

# Dashboard Endpoints
@router.get("/dashboard/stats", response_model=INSPIREResponse[dict])
async def get_dashboard_stats(
    sme_id: Optional[int] = Query(None, description="Filter by SME ID")
):
    """Get comprehensive dashboard statistics"""
    try:
        stats = await inspire_db.get_dashboard_stats(sme_id=sme_id)
        return INSPIREResponse(
            success=True,
            message="Dashboard statistics retrieved successfully",
            data=stats
        )
    except Exception as e:
        logger.error(f"Error retrieving dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard stats: {str(e)}")

@router.get("/dashboard/activity", response_model=INSPIREResponse[List[RecentActivity]])
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of activities to return")
):
    """Get recent activity"""
    try:
        activity = await inspire_db.get_recent_activity(limit)
        # Convert database results to RecentActivity models, handling date conversion
        activities = []
        for item in activity:
            # Ensure date is properly formatted or None
            activity_date = None
            if item.get('date'):
                if isinstance(item['date'], date):
                    activity_date = item['date']
                elif isinstance(item['date'], datetime):
                    activity_date = item['date'].date()
                elif isinstance(item['date'], str):
                    try:
                        activity_date = datetime.fromisoformat(item['date'].replace('Z', '+00:00')).date()
                    except:
                        try:
                            activity_date = datetime.strptime(item['date'], '%Y-%m-%d').date()
                        except:
                            activity_date = None
            
            activities.append(RecentActivity(
                type=item.get('type', ''),
                id=item.get('id', 0),
                content=item.get('content', ''),
                date=activity_date,
                source=item.get('source', '')
            ))
        
        return INSPIREResponse(
            success=True,
            message="Recent activity retrieved successfully",
            data=activities
        )
    except Exception as e:
        logger.error(f"Error retrieving recent activity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving recent activity: {str(e)}")

# Health Check
@router.get("/health", response_model=INSPIREResponse[dict])
async def health_check():
    """Health check endpoint"""
    try:
        is_connected = await inspire_db.db.test_connection()
        return INSPIREResponse(
            success=is_connected,
            message="Database connection healthy" if is_connected else "Database connection failed",
            data={"database_connected": is_connected}
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return INSPIREResponse(
            success=False,
            message="Health check failed",
            error=str(e),
            data={"database_connected": False}
        )
