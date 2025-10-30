"""
Outreach Service for generating tailored email, call, and meeting content
based on SME objectives and company articles.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import os
import aiohttp
from ..models import OutreachType

logger = logging.getLogger(__name__)

class OutreachService:
    def __init__(self):
        self.ollama_url = os.getenv('OLLAMA_BASE_URL') or os.getenv('OLLAMA_URL', 'http://localhost:11434')
        
    async def generate_outreach_content(
        self,
        outreach_type: OutreachType,
        company_name: str,
        company_info: Dict[str, Any],
        sme_info: Dict[str, Any],
        relevant_articles: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        Generate tailored outreach content based on company data and SME objectives.
        
        Args:
            outreach_type: Type of outreach (email, call, meeting)
            company_name: Name of the target company
            company_info: Company details (location, industry, description, etc.)
            sme_info: SME details (name, sector, objectives)
            relevant_articles: List of relevant articles about the company
            
        Returns:
            Dict with 'title' and 'content' keys
        """
        try:
            # Prepare context for LLM
            context = self._prepare_context(
                company_name, company_info, sme_info, relevant_articles
            )
            
            # Generate content based on outreach type
            if outreach_type == OutreachType.EMAIL:
                return await self._generate_email_content(context)
            elif outreach_type == OutreachType.CALL:
                return await self._generate_call_content(context)
            elif outreach_type == OutreachType.MEETING:
                return await self._generate_meeting_content(context)
            else:
                raise ValueError(f"Unsupported outreach type: {outreach_type}")
                
        except Exception as e:
            logger.error(f"Error generating {outreach_type} outreach: {str(e)}")
            # Return fallback content
            return self._get_fallback_content(outreach_type, company_name)
    
    def _prepare_context(
        self,
        company_name: str,
        company_info: Dict[str, Any],
        sme_info: Dict[str, Any],
        relevant_articles: List[Dict[str, Any]]
    ) -> str:
        """Prepare context string for LLM prompt."""
        
        # Company information
        company_context = f"""
COMPANY INFORMATION:
- Name: {company_name}
- Location: {company_info.get('location', 'Unknown')}
- Industry: {company_info.get('industry', 'Unknown')}
- Description: {company_info.get('description', 'No description available')}
- Website: {company_info.get('website', 'Not provided')}
"""
        
        # SME information
        sme_context = f"""
SME INFORMATION:
- Name: {sme_info.get('name', 'Unknown')}
- Sector: {sme_info.get('sector', 'Unknown')}
- Objectives: {sme_info.get('objective', 'No specific objectives provided')}
"""
        
        # Recent articles context
        articles_context = "RECENT COMPANY NEWS & UPDATES:\n"
        if relevant_articles:
            for i, article in enumerate(relevant_articles[:5], 1):  # Limit to top 5 articles
                articles_context += f"""
{i}. {article.get('title', 'No title')}
   Source: {article.get('source', 'Unknown')}
   Published: {article.get('published_date', 'Unknown date')}
   Classification: {article.get('classification', 'Unknown')}
   Summary: {article.get('content', 'No content available')[:200]}...
"""
        else:
            articles_context += "No recent articles available.\n"
        
        return f"{company_context}\n{sme_context}\n{articles_context}"
    
    async def _generate_email_content(self, context: str) -> Dict[str, str]:
        """Generate email outreach content."""
        prompt = f"""
Based on the following information, create a professional and personalized email outreach for business partnership or collaboration opportunities.

{context}

Please generate:
1. A compelling email subject line
2. A professional email body that:
   - Introduces the SME and their capabilities
   - References specific recent company developments (from the articles)
   - Proposes potential collaboration opportunities
   - Includes a clear call-to-action
   - Maintains a professional but engaging tone
   - Is concise (under 200 words)

Format your response as JSON:
{{
    "title": "Email subject line here",
    "content": "Email body content here"
}}
"""
        
        return await self._call_llm(prompt, "email")
    
    async def _generate_call_content(self, context: str) -> Dict[str, str]:
        """Generate call script content."""
        prompt = f"""
Based on the following information, create a professional call script for business outreach.

{context}

Please generate:
1. A brief call title/purpose
2. A structured call script that includes:
   - Opening introduction (30 seconds)
   - Company research talking points (referencing recent articles)
   - Value proposition presentation
   - Questions to ask the prospect
   - Closing and next steps
   - Objection handling tips

Format your response as JSON:
{{
    "title": "Call purpose/title here",
    "content": "Structured call script here"
}}
"""
        
        return await self._call_llm(prompt, "call")
    
    async def _generate_meeting_content(self, context: str) -> Dict[str, str]:
        """Generate meeting agenda content."""
        prompt = f"""
Based on the following information, create a professional meeting agenda for business partnership discussion.

{context}

Please generate:
1. A meeting title
2. A detailed meeting agenda that includes:
   - Meeting objectives
   - Agenda items with time allocations
   - Discussion points about recent company developments
   - Partnership opportunity exploration
   - Action items and next steps
   - Meeting duration estimate

Format your response as JSON:
{{
    "title": "Meeting title here",
    "content": "Detailed meeting agenda here"
}}
"""
        
        return await self._call_llm(prompt, "meeting")
    
    async def _call_llm(self, prompt: str, outreach_type: str) -> Dict[str, str]:
        """Call Ollama LLM to generate content."""
        try:
            payload = {
                "model": "llama3.1:latest",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 1000
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        generated_text = result.get('response', '')
                        
                        # Try to parse JSON response
                        try:
                            # Look for JSON in the response
                            start_idx = generated_text.find('{')
                            end_idx = generated_text.rfind('}') + 1
                            if start_idx != -1 and end_idx != -1:
                                json_str = generated_text[start_idx:end_idx]
                                parsed_content = json.loads(json_str)
                                return {
                                    "title": parsed_content.get("title", f"Generated {outreach_type.title()} Outreach"),
                                    "content": parsed_content.get("content", generated_text)
                                }
                        except json.JSONDecodeError:
                            logger.warning(f"Could not parse JSON from LLM response for {outreach_type}")
                        
                        # Fallback: use the entire response as content
                        return {
                            "title": f"Generated {outreach_type.title()} Outreach",
                            "content": generated_text
                        }
                    else:
                        logger.error(f"LLM API error: {response.status}")
                        raise Exception(f"LLM API returned status {response.status}")
                        
        except Exception as e:
            logger.error(f"Error calling LLM for {outreach_type}: {str(e)}")
            raise
    
    def _get_fallback_content(self, outreach_type: OutreachType, company_name: str) -> Dict[str, str]:
        """Provide fallback content when LLM is unavailable."""
        
        fallback_content = {
            OutreachType.EMAIL: {
                "title": f"Partnership Opportunity with {company_name}",
                "content": f"""Dear {company_name} Team,

I hope this email finds you well. I'm reaching out to explore potential partnership opportunities between our organizations.

Based on our research, we believe there could be valuable synergies between our companies that could benefit both parties.

I would welcome the opportunity to discuss this further at your convenience.

Best regards,
[Your Name]"""
            },
            OutreachType.CALL: {
                "title": f"Partnership Discussion Call with {company_name}",
                "content": f"""CALL SCRIPT - {company_name} Outreach

OPENING (30 seconds):
- Introduce yourself and company
- Mention you've been researching {company_name}
- Ask if they have a few minutes to discuss partnership opportunities

MAIN DISCUSSION:
- Present your company's value proposition
- Discuss potential collaboration areas
- Ask about their current business priorities

CLOSING:
- Summarize key points
- Propose next steps (meeting/follow-up call)
- Thank them for their time"""
            },
            OutreachType.MEETING: {
                "title": f"Partnership Exploration Meeting - {company_name}",
                "content": f"""MEETING AGENDA - {company_name} Partnership Discussion

MEETING OBJECTIVES:
- Explore partnership opportunities
- Understand mutual business goals
- Identify collaboration areas

AGENDA (60 minutes):
1. Introductions (10 min)
2. Company overviews (20 min)
3. Partnership opportunities discussion (20 min)
4. Next steps and action items (10 min)

PREPARATION:
- Research {company_name}'s recent developments
- Prepare company presentation
- List potential collaboration areas"""
            }
        }
        
        return fallback_content.get(outreach_type, {
            "title": f"Outreach to {company_name}",
            "content": "Please contact the company to discuss partnership opportunities."
        })
