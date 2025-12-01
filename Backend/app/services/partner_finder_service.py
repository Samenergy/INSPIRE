"""
Partner Finder Service
Uses OpenAI to generate optimized search queries from SME business description,
searches Google Local via SerpAPI, and extracts relevant partners.
"""

import logging
import json
import asyncio
from typing import List, Dict, Any, Optional
import aiohttp
from uuid import uuid4
from app.config import settings
from app.database_mysql_inspire import inspire_db
from app.tasks.unified_analysis_task import run_unified_analysis
from loguru import logger

logger = logging.getLogger(__name__)


class PartnerFinderService:
    """Service for AI-powered partner discovery"""
    
    def __init__(self):
        self.openai_api_key = settings.openai_api_key
        self.serpapi_key = settings.serpapi_key
        self.base_url = "https://serpapi.com/search"
    
    async def auto_find_partners(self, sme_id: int, sme_objective: str, location: Optional[str] = None, auto_analyze: bool = True) -> Dict[str, Any]:
        """
        Automatically find partners for an SME using AI-powered search.
        
        Args:
            sme_id: SME ID
            sme_objective: Business description/objectives
            location: Optional location to search in (defaults to Rwanda)
            auto_analyze: Whether to automatically trigger analysis for each saved company (default: True)
            
        Returns:
            Dict with found partners and metadata
        """
        if not self.serpapi_key:
            raise ValueError("SERPAPI_API_KEY is not configured")
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured. Please add it to your .env file.")
        
        # Default to Rwanda if no location specified
        if not location:
            location = "Rwanda"
        
        try:
            # Step 1: Generate optimized search queries using OpenAI
            logger.info(f"Generating search queries for SME {sme_id}")
            search_queries = await self._generate_search_queries(sme_objective, location)
            
            if not search_queries:
                raise ValueError("Failed to generate search queries")
            
            # Step 2: Search Google Local for each query
            logger.info(f"Searching Google Local with {len(search_queries)} queries")
            all_businesses = []
            for query in search_queries:
                businesses = await self._search_google_local(query, location)
                all_businesses.extend(businesses)
            
            # Remove duplicates based on name and location
            unique_businesses = self._deduplicate_businesses(all_businesses)
            logger.info(f"Found {len(unique_businesses)} unique businesses")
            
            # Step 3: Use OpenAI to extract and filter relevant partners
            logger.info("Extracting relevant partners using OpenAI")
            relevant_partners = await self._extract_relevant_partners(
                sme_objective, unique_businesses
            )
            
            # Step 4: Save partners to database and trigger analysis
            saved_partners = []
            analysis_jobs = []  # Track analysis job IDs for frontend polling
            
            for partner in relevant_partners:
                try:
                    # Check if company already exists
                    existing = await inspire_db.get_company_by_name(
                        partner['name'], sme_id
                    )
                    
                    if existing:
                        logger.info(f"Company {partner['name']} already exists, skipping")
                        continue
                    
                    # Create company
                    company_id = await inspire_db.create_company(
                        name=partner['name'],
                        location=partner.get('location', location),
                        description=partner.get('organisation_type', ''),
                        industry=partner.get('organisation_type', ''),
                        website=partner.get('website'),
                        sme_id=sme_id
                    )
                    
                    partner_data = {
                        'company_id': company_id,
                        'name': partner['name'],
                        'location': partner.get('location', location),
                        'website': partner.get('website'),
                        'phone': partner.get('phone'),
                        'organisation_type': partner.get('organisation_type', ''),
                        'analysis_job_id': None
                    }
                    
                    # Automatically trigger analysis for this company
                    if auto_analyze:
                        try:
                            logger.info(f"Triggering automatic analysis for company {partner['name']} (ID: {company_id})")
                            job_identifier = f"partner-finder-{company_id}-{uuid4().hex[:8]}"
                            
                            # Trigger unified analysis as a Celery task (non-blocking)
                            task = run_unified_analysis.delay(
                                company_name=partner['name'],
                                company_location=partner.get('location', location),
                                sme_id=sme_id,
                                sme_objective=sme_objective,
                                max_articles=100,
                                company_id=company_id,
                                job_identifier=job_identifier
                            )
                            
                            # Store job ID for frontend tracking
                            partner_data['analysis_job_id'] = job_identifier
                            analysis_jobs.append({
                                'company_id': company_id,
                                'company_name': partner['name'],
                                'job_id': job_identifier,
                                'task_id': task.id if task else None
                            })
                            
                            logger.info(f"✅ Analysis queued for company {partner['name']} (job: {job_identifier}, task: {task.id if task else 'N/A'})")
                        except Exception as analysis_error:
                            logger.error(f"Failed to trigger analysis for {partner['name']}: {analysis_error}")
                            # Continue with other companies even if one analysis fails
                    
                    saved_partners.append(partner_data)
                    
                except Exception as e:
                    logger.error(f"Error saving partner {partner.get('name', 'unknown')}: {e}")
                    continue
            
            return {
                'success': True,
                'partners_found': len(relevant_partners),
                'partners_saved': len(saved_partners),
                'partners': saved_partners,
                'analysis_jobs': analysis_jobs,  # Include analysis job IDs
                'search_queries_used': search_queries,
                'total_businesses_found': len(unique_businesses)
            }
            
        except Exception as e:
            logger.error(f"Error in auto_find_partners: {e}")
            raise
    
    async def _generate_search_queries(self, sme_objective: str, location: str) -> List[str]:
        """Generate optimized Google Local search queries using OpenAI"""
        prompt = f"""Based on the following business description, generate 3-5 optimized Google Local search queries to find potential business partners.

Business Description:
{sme_objective}

Location: {location}

Generate search queries that would help find:
- Companies that could be suppliers, customers, or collaborators
- Businesses in complementary industries
- Organizations that might need this type of service/product
- Potential strategic partners

IMPORTANT: Return ONLY a JSON array of search query strings, nothing else. Example format:
["query 1", "query 2", "query 3"]

Return ONLY the JSON array, no additional text or explanations."""

        system_message = "You are a business intelligence assistant. Generate optimized Google Local search queries to find potential business partners. Always return valid JSON arrays."
        
        generated_text = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.7,
            max_tokens=500
        )
        
        if not generated_text:
            raise ValueError("OpenAI failed to generate search queries")
        
        # Try to extract JSON array from response
        try:
            # Remove markdown code blocks if present
            generated_text = generated_text.strip()
            if generated_text.startswith("```"):
                # Remove code block markers
                lines = generated_text.split("\n")
                generated_text = "\n".join(lines[1:-1]) if len(lines) > 2 else generated_text
            
            # Parse JSON
            queries = json.loads(generated_text)
            if isinstance(queries, list) and all(isinstance(q, str) for q in queries):
                return queries[:5]  # Limit to 5 queries
            else:
                raise ValueError("Invalid query format")
        except json.JSONDecodeError:
            # Try to extract array from text
            import re
            matches = re.findall(r'\[(.*?)\]', generated_text, re.DOTALL)
            if matches:
                try:
                    queries = json.loads(f"[{matches[0]}]")
                    if isinstance(queries, list):
                        return queries[:5]
                except:
                    pass
            
            # Fallback: split by lines and clean
            lines = [line.strip().strip('"').strip("'") for line in generated_text.split("\n")]
            queries = [q for q in lines if q and len(q) > 5][:5]
            return queries if queries else [
                f"business partners {sme_objective[:50]} {location}",
                f"companies {sme_objective[:50]} {location}",
                f"organizations {sme_objective[:50]} {location}"
            ]
    
    async def _search_google_local(self, query: str, location: str) -> List[Dict[str, Any]]:
        """Search Google Local/Maps via SerpAPI"""
        businesses = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Use google_maps engine for local business searches
                params = {
                    "api_key": self.serpapi_key,
                    "engine": "google_maps",
                    "q": f"{query} {location}",
                    "type": "search",
                    "hl": "en",
                    "gl": "rw"  # Rwanda
                }
                
                logger.debug(f"Searching Google Maps with query: {query} in {location}")
                
                async with session.get(self.base_url, params=params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Extract local results - Google Maps API returns results in 'local_results' field
                        local_results = data.get("local_results", [])
                        
                        # If no local_results, try alternative response formats
                        if not local_results:
                            # Try organic_results as fallback
                            organic_results = data.get("organic_results", [])
                            if organic_results:
                                logger.info(f"Using organic_results as fallback for query: {query}")
                                local_results = organic_results
                        
                        for result in local_results:
                            try:
                                business = {
                                    'name': result.get('title') or result.get('name', ''),
                                    'location': result.get('address') or result.get('location', ''),
                                    'website': result.get('website', ''),
                                    'phone': result.get('phone', ''),
                                    'organisation_type': result.get('type') or result.get('category', ''),
                                    'rating': result.get('rating', 0),
                                    'reviews': result.get('reviews', 0),
                                    'raw_data': result
                                }
                                
                                if business['name']:
                                    businesses.append(business)
                            except Exception as e:
                                logger.warning(f"Error processing business result: {e}")
                                continue
                        
                        logger.info(f"Found {len(businesses)} businesses for query: {query}")
                    else:
                        error_text = await response.text()
                        logger.warning(f"SerpAPI request failed: {response.status} - {error_text}")
                        # Log the full response for debugging
                        try:
                            error_data = await response.json()
                            logger.warning(f"SerpAPI error response: {error_data}")
                        except:
                            pass
        
        except aiohttp.ClientError as e:
            logger.error(f"Network error searching Google Local: {e}")
        except Exception as e:
            logger.error(f"Error searching Google Local: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
        
        return businesses
    
    def _deduplicate_businesses(self, businesses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate businesses based on name and location"""
        seen = set()
        unique = []
        
        for business in businesses:
            # Create a key from name and location
            key = (
                business.get('name', '').lower().strip(),
                business.get('location', '').lower().strip()
            )
            
            if key not in seen and business.get('name'):
                seen.add(key)
                unique.append(business)
        
        return unique
    
    async def _extract_relevant_partners(
        self, 
        sme_objective: str, 
        businesses: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Use OpenAI to extract and filter the most relevant partners"""
        
        # Limit to top 30 businesses for OpenAI processing
        businesses_to_process = businesses[:30]
        logger.info(f"Processing {len(businesses_to_process)} businesses through OpenAI (out of {len(businesses)} total)")
        
        # Format businesses for OpenAI (compact format to reduce token count)
        businesses_text = "\n".join([
            f"{i+1}. {b.get('name', 'Unknown')} | {b.get('location', 'Unknown')[:50]} | {b.get('organisation_type', 'Unknown')[:30]}"
            for i, b in enumerate(businesses_to_process)
        ])
        
        prompt = f"""Based on the following business description, identify the most relevant potential partners from the list of businesses below.

Business Description:
{sme_objective}

List of Businesses:
{businesses_text}

Analyze each business and select only the ones that are:
1. Most relevant as potential partners (suppliers, customers, collaborators)
2. Aligned with the business objectives
3. Likely to benefit from or provide value to the business described

IMPORTANT: Return ONLY a JSON array of objects, each with these exact fields:
- name (string): Business name
- location (string): Business location/address
- organisation_type (string): Type of organization/business
- website (string): Website URL if available, empty string if not
- phone (string): Phone number if available, empty string if not

Select the top 8-12 most relevant partners. Return ONLY the JSON array, no additional text.

Example format:
[
  {{"name": "Company Name", "location": "Address", "organisation_type": "Type", "website": "https://example.com", "phone": "+250..."}},
  ...
]"""

        logger.info("Calling OpenAI to extract relevant partners...")
        generated_text = await self._call_openai(
            prompt=prompt,
            system_message="You are a business intelligence assistant. Analyze businesses and identify the most relevant potential partners. Always return valid JSON arrays.",
            temperature=0.5,
            max_tokens=2000
        )
        logger.info("OpenAI extraction completed")
        
        if not generated_text:
            logger.warning("OpenAI failed to extract partners, returning all businesses")
            return businesses[:15]  # Fallback: return first 15
        
        # Try to parse JSON
        try:
            # Remove markdown code blocks if present
            generated_text = generated_text.strip()
            if generated_text.startswith("```"):
                lines = generated_text.split("\n")
                generated_text = "\n".join(lines[1:-1]) if len(lines) > 2 else generated_text
            
            partners = json.loads(generated_text)
            if isinstance(partners, list):
                # Validate and clean partner data
                valid_partners = []
                for partner in partners:
                    if isinstance(partner, dict) and partner.get('name'):
                        valid_partners.append({
                            'name': partner.get('name', ''),
                            'location': partner.get('location', ''),
                            'organisation_type': partner.get('organisation_type', ''),
                            'website': partner.get('website', ''),
                            'phone': partner.get('phone', '')
                        })
                
                return valid_partners[:15]  # Limit to 15 partners
            else:
                raise ValueError("Invalid response format")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            logger.debug(f"OpenAI response: {generated_text}")
            # Fallback: return first 15 businesses
            return businesses[:15]
    
    async def _call_openai(
        self,
        prompt: str,
        system_message: str = "",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Optional[str]:
        """Call OpenAI API for fast LLM inference"""
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured")
        
        try:
            async with aiohttp.ClientSession() as session:
                messages = []
                if system_message:
                    messages.append({"role": "system", "content": system_message})
                messages.append({"role": "user", "content": prompt})
                
                async with session.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    },
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data['choices'][0]['message']['content'].strip()
                        logger.info("✅ Generated using OpenAI (gpt-3.5-turbo)")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"OpenAI API error: {response.status} - {error_text}")
                        raise Exception(f"OpenAI API error: {response.status}")
        except Exception as e:
            logger.error(f"Error calling OpenAI: {e}")
            raise
