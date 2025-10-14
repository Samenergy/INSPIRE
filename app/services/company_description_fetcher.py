"""Company Description Fetcher using SerpAPI targeted queries.

This service fetches company descriptions by searching SerpAPI with targeted
queries like "What is {company_name} in {location}".
"""

import aiohttp
from typing import Dict, Any, Optional
from loguru import logger
from app.config import settings


class CompanyDescriptionFetcher:
    """Fetches company descriptions using SerpAPI targeted searches."""
    
    def __init__(self):
        """Initialize the description fetcher."""
        self.api_key = settings.serpapi_key
        self.base_url = "https://serpapi.com/search"
        self.session = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self.session
    
    async def fetch_company_overview(self, company_name: str, location: str) -> Dict[str, Any]:
        """
        Fetch company overview information using targeted SerpAPI search.
        
        YOUR CONTRIBUTION: Custom query strategy to get company overviews
        
        Args:
            company_name: Name of the company
            location: Company location
            
        Returns:
            Dict with 'description', 'full_text', 'source', 'confidence'
        """
        if not self.api_key:
            logger.warning("SerpAPI key not configured")
            return {
                'description': None,
                'full_text': None,
                'source': 'none',
                'confidence': 'none'
            }
        
        # Try multiple query strategies
        queries = [
            f"What is {company_name} in {location}",
            f"What is {company_name}",
            f"{company_name} {location} company overview",
            f"{company_name} about company"
        ]
        
        for query in queries:
            try:
                logger.info(f"Trying query: '{query}'")
                overview_data = await self._search_for_overview(query, company_name)
                
                if overview_data and overview_data.get('description'):
                    return overview_data
                    
            except Exception as e:
                logger.warning(f"Query '{query}' failed: {e}")
                continue
        
        # No overview found
        return {
            'description': None,
            'full_text': None,
            'source': 'none',
            'confidence': 'none'
        }
    
    async def _search_for_overview(self, query: str, company_name: str) -> Optional[Dict[str, Any]]:
        """
        Search SerpAPI and extract company overview information.
        
        YOUR CONTRIBUTION: Multi-source extraction strategy
        Gets both description and full content for strength extraction
        """
        try:
            session = await self._get_session()
            
            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": query,
                "num": 5,
                "gl": "us",
                "hl": "en"
            }
            
            async with session.get(self.base_url, params=params) as response:
                if response.status != 200:
                    logger.warning(f"SerpAPI request failed: {response.status}")
                    return None
                
                data = await response.json()
                
                # Strategy 1: Try Knowledge Graph (best source!)
                knowledge_graph = data.get("knowledge_graph", {})
                if knowledge_graph:
                    description = self._extract_from_knowledge_graph(knowledge_graph)
                    if description:
                        # Get full text from knowledge graph for strength extraction
                        full_text = self._get_knowledge_graph_full_text(knowledge_graph)
                        return {
                            'description': description,
                            'full_text': full_text,
                            'source': 'knowledge_graph',
                            'confidence': 'high'
                        }
                
                # Strategy 2: Try Answer Box
                answer_box = data.get("answer_box", {})
                if answer_box:
                    description = self._extract_from_answer_box(answer_box)
                    if description:
                        full_text = answer_box.get("answer", "") or answer_box.get("snippet", "")
                        return {
                            'description': description,
                            'full_text': full_text,
                            'source': 'answer_box',
                            'confidence': 'high'
                        }
                
                # Strategy 3: Try Featured Snippet
                featured_snippet = data.get("featured_snippet", {})
                if featured_snippet:
                    description = featured_snippet.get("snippet", "")
                    if description and len(description) > 50:
                        return {
                            'description': description,
                            'full_text': description,
                            'source': 'featured_snippet',
                            'confidence': 'medium'
                        }
                
                # Strategy 4: Try first organic result snippet
                organic_results = data.get("organic_results", [])
                if organic_results:
                    for result in organic_results[:5]:
                        snippet = result.get("snippet", "")
                        title = result.get("title", "").lower()
                        url = result.get("link", "").lower()
                        
                        # Prioritize company websites, LinkedIn, Crunchbase, etc.
                        trusted_sources = [
                            'linkedin.com', 'crunchbase.com', 'wikipedia.org',
                            'bloomberg.com', 'reuters.com', 'forbes.com'
                        ]
                        
                        is_trusted = any(source in url for source in trusted_sources)
                        
                        # Check if it's likely about the company
                        if company_name.lower() in snippet.lower():
                            # Check if it describes what the company is/does
                            description_indicators = [
                                'is a', 'is the', 'is an', 'provides', 'offers', 
                                'company', 'telecommunications', 'fintech', 'technology',
                                'operates', 'specializes', 'leader', 'provider',
                                'startup', 'enterprise', 'organization', 'firm',
                                'software', 'digital', 'services', 'solutions'
                            ]
                            
                            # Must have at least 2 indicators for non-trusted sources
                            indicator_count = sum(1 for ind in description_indicators if ind in snippet.lower())
                            
                            if is_trusted and indicator_count >= 1:
                                if len(snippet) > 50:
                                    return {
                                        'description': snippet,
                                        'full_text': snippet,
                                        'source': f'organic_result (trusted: {url.split("/")[2]})',
                                        'confidence': 'high'
                                    }
                            elif indicator_count >= 2:
                                if len(snippet) > 50:
                                    return {
                                        'description': snippet,
                                        'full_text': snippet,
                                        'source': 'organic_result',
                                        'confidence': 'medium'
                                    }
                
                return None
                
        except Exception as e:
            logger.error(f"Error searching for description: {e}")
            return None
    
    def _get_knowledge_graph_full_text(self, kg: Dict[str, Any]) -> str:
        """
        Extract all text from knowledge graph for strength extraction.
        
        YOUR CONTRIBUTION: Comprehensive information gathering
        """
        text_parts = []
        
        # Description
        if kg.get("description"):
            text_parts.append(kg['description'])
        
        # Type and title
        if kg.get("title") and kg.get("type"):
            text_parts.append(f"{kg['title']} is a {kg['type']}")
        
        # Founded
        if kg.get("founded"):
            text_parts.append(f"Founded in {kg['founded']}")
        
        # Headquarters
        if kg.get("headquarters"):
            text_parts.append(f"Headquartered in {kg['headquarters']}")
        
        # CEO/Founder
        if kg.get("ceo"):
            text_parts.append(f"CEO: {kg['ceo']}")
        if kg.get("founder"):
            text_parts.append(f"Founder: {kg['founder']}")
        
        # Revenue
        if kg.get("revenue"):
            text_parts.append(f"Revenue: {kg['revenue']}")
        
        # Employees
        if kg.get("employees"):
            text_parts.append(f"Employees: {kg['employees']}")
        
        # Stock price
        if kg.get("stock"):
            text_parts.append(f"Stock: {kg['stock']}")
        
        # Products/Services
        if kg.get("products"):
            products = kg['products'] if isinstance(kg['products'], str) else ', '.join(kg['products'][:5])
            text_parts.append(f"Products/Services: {products}")
        
        # Subsidiaries
        if kg.get("subsidiaries"):
            subs = kg['subsidiaries'] if isinstance(kg['subsidiaries'], str) else ', '.join(kg['subsidiaries'][:5])
            text_parts.append(f"Subsidiaries: {subs}")
        
        return '. '.join(text_parts)
    
    def _extract_from_knowledge_graph(self, kg: Dict[str, Any]) -> Optional[str]:
        """
        Extract description from Knowledge Graph.
        
        YOUR CONTRIBUTION: Knowledge graph parsing logic with validation
        """
        # Check if this is actually about a company (not a location, person, etc.)
        kgtype = kg.get("type", "").lower()
        
        # Skip if it's clearly NOT a company
        invalid_types = [
            'charging station', 'gas station', 'restaurant', 'hotel',
            'landmark', 'place', 'park', 'school', 'hospital',
            'person', 'celebrity', 'athlete', 'politician'
        ]
        
        if any(invalid in kgtype for invalid in invalid_types):
            logger.info(f"Skipping Knowledge Graph - type is '{kgtype}' (not a company)")
            return None
        
        # Try description field first
        description = kg.get("description")
        if description and len(description) > 30:
            # Validate description is about a company
            company_indicators = [
                'company', 'corporation', 'business', 'provider', 'operator',
                'telecommunications', 'fintech', 'startup', 'enterprise',
                'services', 'platform', 'network', 'subsidiary', 'firm'
            ]
            
            description_lower = description.lower()
            if any(indicator in description_lower for indicator in company_indicators):
                return description
            else:
                logger.info(f"Description doesn't seem company-related: {description[:100]}")
        
        # Try title + type (only if type indicates a company)
        title = kg.get("title", "")
        if title and kgtype:
            company_types = [
                'company', 'corporation', 'telecommunications', 'fintech',
                'startup', 'business', 'provider', 'operator', 'organization'
            ]
            
            if any(ctype in kgtype for ctype in company_types):
                description = f"{title} is a {kgtype}"
                
                # Add additional info if available
                if kg.get("founded"):
                    description += f", founded in {kg.get('founded')}"
                
                if kg.get("headquarters"):
                    description += f", headquartered in {kg.get('headquarters')}"
                
                return description
        
        return None
    
    def _extract_from_answer_box(self, answer: Dict[str, Any]) -> Optional[str]:
        """
        Extract description from Answer Box.
        
        YOUR CONTRIBUTION: Answer box parsing logic
        """
        # Try answer field
        description = answer.get("answer")
        if description and len(description) > 30:
            return description
        
        # Try snippet
        snippet = answer.get("snippet")
        if snippet and len(snippet) > 30:
            return snippet
        
        return None
    
    async def close(self):
        """Close the HTTP session."""
        if self.session and not self.session.closed:
            await self.session.close()

