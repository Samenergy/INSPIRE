"""
Outreach API endpoints for generating email, call, and meeting content
tailored to SME objectives and company articles.
"""

import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Form, HTTPException, Depends
from datetime import datetime

from ..models import (
    INSPIREResponse, OutreachRequest, OutreachResponse, OutreachType,
    Campaign, CampaignCreate
)
from ..database_mysql_inspire import inspire_db
from ..services.outreach_service import OutreachService
from ..routers.auth import get_current_sme

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/outreach", tags=["outreach"])

# Initialize outreach service
outreach_service = OutreachService()

@router.post(
    "/generate",
    response_model=INSPIREResponse[OutreachResponse],
    summary="Generate Outreach Content",
    description="Generate tailored outreach content (email, call, meeting) based on SME objectives and company articles"
)
async def generate_outreach(
    company_id: int = Form(..., description="Company ID to generate outreach for"),
    outreach_type: str = Form(..., description="Type of outreach: email, call, or meeting"),
    current_sme: Dict[str, Any] = Depends(get_current_sme)
):
    """
    Generate personalized outreach content for a specific company.
    
    The content is tailored based on:
    - SME's business objectives and sector
    - Company's recent articles and updates
    - Company's industry and location
    - Outreach type (email, call, meeting)
    """
    try:
        # Validate outreach type
        try:
            outreach_type_enum = OutreachType(outreach_type.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid outreach type. Must be one of: {', '.join([t.value for t in OutreachType])}"
            )
        
        sme_id = current_sme["sme_id"]
        
        # Get company information
        company = await inspire_db.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Verify company belongs to the SME
        if company.get('sme_id') != sme_id:
            raise HTTPException(status_code=403, detail="Access denied: Company does not belong to your SME")
        
        # Get SME information
        sme_info = await inspire_db.get_sme(sme_id)
        if not sme_info:
            raise HTTPException(status_code=404, detail="SME not found")
        
        # Get relevant articles for the company
        articles_data = await inspire_db.get_all_articles_by_classification_for_company(company_id)
        
        # Combine relevant articles (prioritize directly relevant, then indirectly useful)
        relevant_articles = []
        relevant_articles.extend(articles_data.get('directly_relevant', [])[:3])  # Top 3 directly relevant
        relevant_articles.extend(articles_data.get('indirectly_useful', [])[:2])  # Top 2 indirectly useful
        
        # Get latest RAG analysis data if available
        rag_analysis = None
        latest_analysis = await inspire_db.get_latest_analysis_for_company(company_id)
        
        if latest_analysis:
            try:
                import json
                rag_analysis = {
                    'latest_updates': json.loads(latest_analysis.get('latest_updates', '{}')) if latest_analysis.get('latest_updates') else {},
                    'challenges': json.loads(latest_analysis.get('challenges', '{}')) if latest_analysis.get('challenges') else {},
                    'decision_makers': json.loads(latest_analysis.get('decision_makers', '{}')) if latest_analysis.get('decision_makers') else {},
                    'market_position': json.loads(latest_analysis.get('market_position', '{}')) if latest_analysis.get('market_position') else {},
                    'future_plans': json.loads(latest_analysis.get('future_plans', '{}')) if latest_analysis.get('future_plans') else {},
                    'action_plan': json.loads(latest_analysis.get('action_plan', '{}')) if latest_analysis.get('action_plan') else {},
                    'solutions': json.loads(latest_analysis.get('solutions', '{}')) if latest_analysis.get('solutions') else {},
                    'date_analyzed': latest_analysis.get('date_analyzed')
                }
                logger.info(f"✅ Found RAG analysis data for company {company['name']} (analyzed: {rag_analysis['date_analyzed']})")
            except Exception as e:
                logger.warning(f"Failed to parse RAG analysis data: {e}")
                rag_analysis = None
        
        # Get company intelligence fields (from company table)
        company_intelligence = {}
        if company.get('company_info'):
            try:
                import json
                company_intelligence['company_info'] = json.loads(company.get('company_info'))
            except:
                pass
        if company.get('strengths'):
            try:
                company_intelligence['strengths'] = json.loads(company.get('strengths'))
            except:
                pass
        if company.get('opportunities'):
            try:
                company_intelligence['opportunities'] = json.loads(company.get('opportunities'))
            except:
                pass
        
        logger.info(f"Generating {outreach_type} outreach for company {company['name']} (ID: {company_id})")
        logger.info(f"Found {len(relevant_articles)} relevant articles for context")
        if rag_analysis:
            logger.info("Using RAG analysis data for enhanced personalization")
        
        # Generate outreach content using the service
        generated_content = await outreach_service.generate_outreach_content(
            outreach_type=outreach_type_enum,
            company_name=company['name'],
            company_info={
                'location': company.get('location'),
                'industry': company.get('industry'),
                'description': company.get('description'),
                'website': company.get('website'),
                **company_intelligence  # Include company_info, strengths, opportunities
            },
            sme_info={
                'name': sme_info.get('name'),
                'sector': sme_info.get('sector'),
                'objective': sme_info.get('objective')
            },
            relevant_articles=relevant_articles,
            rag_analysis=rag_analysis  # Include RAG analysis data
        )
        
        # Extract subject from content for email campaigns
        campaign_title = generated_content['title']
        if outreach_type_enum == OutreachType.EMAIL:
            import json
            import re
            
            # Always try to extract subject from content JSON for email campaigns
            try:
                content_str = generated_content['content']
                extracted_subject = None
                
                # Method 1: Try JSON parsing
                if content_str.strip().startswith('{'):
                    try:
                        parsed = json.loads(content_str)
                        if parsed.get('title') and parsed['title'].strip():
                            extracted_subject = parsed['title'].strip()
                    except:
                        pass
                
                # Method 2: Try regex extraction if JSON parsing didn't work
                if not extracted_subject and '"title"' in content_str:
                    # Try extracting with proper escaping
                    match = re.search(r'"title"\s*:\s*"((?:[^"\\]|\\.)*)"', content_str)
                    if match:
                        extracted_subject = match.group(1)
                        # Unescape JSON string
                        extracted_subject = extracted_subject.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t').replace('\\r', '\r').replace('\\\\', '\\').strip()
                
                # Method 3: Try simpler regex if complex regex didn't work
                if not extracted_subject and '"title"' in content_str:
                    match = re.search(r'"title"\s*:\s*"([^"]+)"', content_str)
                    if match:
                        extracted_subject = match.group(1).strip()
                
                # Use extracted subject if it's valid and not generic
                if extracted_subject and len(extracted_subject) > 0:
                    subject_lower = extracted_subject.lower()
                    if ('email outreach' not in subject_lower and 
                        'generated' not in subject_lower and
                        subject_lower != 'email outreach' and
                        subject_lower != 'outreach'):
                        campaign_title = extracted_subject
                    else:
                        # Subject is generic, check if current title is better
                        title_lower = campaign_title.lower()
                        if ('email outreach' in title_lower or 
                            title_lower == 'email outreach' or
                            title_lower == 'outreach'):
                            # Both are generic, but prefer extracted if it's different
                            if extracted_subject != campaign_title:
                                campaign_title = extracted_subject
            except Exception as e:
                logger.warning(f"Failed to extract subject from content: {e}")
                pass
        
        # Save the campaign to database
        campaign_id = await inspire_db.create_campaign(
            sme_id=sme_id,
            company_id=company_id,
            outreach_type=outreach_type_enum.value,
            title=campaign_title,  # Use extracted/cleaned title
            content=generated_content['content']
        )
        
        logger.info(f"✅ Successfully generated {outreach_type} outreach (Campaign ID: {campaign_id})")
        
        # Return the response
        response_data = OutreachResponse(
            campaign_id=campaign_id,
            outreach_type=outreach_type_enum,
            title=campaign_title,  # Use extracted/cleaned title
            content=generated_content['content'],
            company_name=company['name'],
            generated_at=datetime.utcnow()
        )
        
        return INSPIREResponse(
            success=True,
            message=f"{outreach_type_enum.value.title()} outreach generated successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating {outreach_type} outreach: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate {outreach_type} outreach: {str(e)}"
        )

@router.get(
    "/campaigns",
    response_model=INSPIREResponse[List[Campaign]],
    summary="Get SME Campaigns",
    description="Get all outreach campaigns for the current SME"
)
async def get_sme_campaigns(
    limit: int = 50,
    current_sme: Dict[str, Any] = Depends(get_current_sme)
):
    """Get all campaigns for the current SME."""
    try:
        sme_id = current_sme["sme_id"]
        
        campaigns_data = await inspire_db.get_campaigns_for_sme(sme_id, limit)
        
        # Transform to Campaign models
        campaigns = []
        for campaign_data in campaigns_data:
            campaign = Campaign(
                campaign_id=campaign_data['campaign_id'],
                sme_id=campaign_data['sme_id'],
                company_id=campaign_data['company_id'],
                outreach_type=OutreachType(campaign_data['outreach_type']),
                title=campaign_data['title'],
                content=campaign_data['content'],
                status=campaign_data['status'],
                generated_at=campaign_data['generated_at'],
                scheduled_at=campaign_data.get('scheduled_at'),
                sent_at=campaign_data.get('sent_at'),
                created_at=campaign_data['created_at'],
                updated_at=campaign_data['updated_at'],
                company_name=campaign_data.get('company_name')  # Include company name from JOIN
            )
            campaigns.append(campaign)
        
        return INSPIREResponse(
            success=True,
            message=f"Retrieved {len(campaigns)} campaigns",
            data=campaigns
        )
        
    except Exception as e:
        logger.error(f"Error getting campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get campaigns: {str(e)}")

@router.get(
    "/campaigns/{campaign_id}",
    response_model=INSPIREResponse[Campaign],
    summary="Get Campaign by ID",
    description="Get a specific campaign by ID"
)
async def get_campaign(
    campaign_id: int,
    current_sme: Dict[str, Any] = Depends(get_current_sme)
):
    """Get a specific campaign by ID."""
    try:
        sme_id = current_sme["sme_id"]
        
        campaign_data = await inspire_db.get_campaign_by_id(campaign_id)
        if not campaign_data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Verify campaign belongs to the SME
        if campaign_data.get('sme_id') != sme_id:
            raise HTTPException(status_code=403, detail="Access denied: Campaign does not belong to your SME")
        
        campaign = Campaign(
            campaign_id=campaign_data['campaign_id'],
            sme_id=campaign_data['sme_id'],
            company_id=campaign_data['company_id'],
            outreach_type=OutreachType(campaign_data['outreach_type']),
            title=campaign_data['title'],
            content=campaign_data['content'],
            status=campaign_data['status'],
            generated_at=campaign_data['generated_at'],
            scheduled_at=campaign_data.get('scheduled_at'),
            sent_at=campaign_data.get('sent_at'),
            created_at=campaign_data['created_at'],
            updated_at=campaign_data['updated_at'],
            company_name=campaign_data.get('company_name')  # Include company name from JOIN
        )
        
        return INSPIREResponse(
            success=True,
            message="Campaign retrieved successfully",
            data=campaign
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get campaign: {str(e)}")

@router.put(
    "/campaigns/{campaign_id}/status",
    response_model=INSPIREResponse[dict],
    summary="Update Campaign Status",
    description="Update the status of a campaign (draft, sent, scheduled, completed)"
)
async def update_campaign_status(
    campaign_id: int,
    status: str = Form(..., description="New status: draft, sent, scheduled, completed"),
    current_sme: Dict[str, Any] = Depends(get_current_sme)
):
    """Update campaign status."""
    try:
        # Validate status
        valid_statuses = ['draft', 'sent', 'scheduled', 'completed']
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        sme_id = current_sme["sme_id"]
        
        # Verify campaign exists and belongs to SME
        campaign_data = await inspire_db.get_campaign_by_id(campaign_id)
        if not campaign_data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        if campaign_data.get('sme_id') != sme_id:
            raise HTTPException(status_code=403, detail="Access denied: Campaign does not belong to your SME")
        
        # Update status
        sent_at = datetime.utcnow().isoformat() if status == 'sent' else None
        success = await inspire_db.update_campaign_status(campaign_id, status, sent_at)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update campaign status")
        
        return INSPIREResponse(
            success=True,
            message=f"Campaign status updated to {status}",
            data={"campaign_id": campaign_id, "status": status}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating campaign {campaign_id} status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update campaign status: {str(e)}")

@router.delete(
    "/campaigns/{campaign_id}",
    response_model=INSPIREResponse[dict],
    summary="Delete Campaign",
    description="Delete a campaign"
)
async def delete_campaign(
    campaign_id: int,
    current_sme: Dict[str, Any] = Depends(get_current_sme)
):
    """Delete a campaign."""
    try:
        sme_id = current_sme["sme_id"]
        
        # Verify campaign exists and belongs to SME
        campaign_data = await inspire_db.get_campaign_by_id(campaign_id)
        if not campaign_data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        if campaign_data.get('sme_id') != sme_id:
            raise HTTPException(status_code=403, detail="Access denied: Campaign does not belong to your SME")
        
        # Delete campaign
        success = await inspire_db.delete_campaign(campaign_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete campaign")
        
        return INSPIREResponse(
            success=True,
            message="Campaign deleted successfully",
            data={"campaign_id": campaign_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete campaign: {str(e)}")
