"""
Outreach Service for generating tailored email, call, and meeting content
based on SME objectives and company articles.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import os
import re
import asyncio
import requests
from ..models import OutreachType

logger = logging.getLogger(__name__)

class OutreachService:
    def __init__(self):
        ollama_url = os.getenv('OLLAMA_BASE_URL') or os.getenv('OLLAMA_URL', 'http://localhost:11434')
        # Ensure URL doesn't have trailing slash and is properly formatted
        self.ollama_url = ollama_url.rstrip('/')
        if not self.ollama_url.startswith(('http://', 'https://')):
            self.ollama_url = f'http://{self.ollama_url}'
        
        logger.info(f"OutreachService initialized with Ollama URL: {self.ollama_url}")
        
    async def generate_outreach_content(
        self,
        outreach_type: OutreachType,
        company_name: str,
        company_info: Dict[str, Any],
        sme_info: Dict[str, Any],
        relevant_articles: List[Dict[str, Any]],
        rag_analysis: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """
        Generate tailored outreach content based on company data and SME objectives.
        
        Args:
            outreach_type: Type of outreach (email, call, meeting)
            company_name: Name of the target company
            company_info: Company details (location, industry, description, etc.)
            sme_info: SME details (name, sector, objectives)
            relevant_articles: List of relevant articles about the company
            rag_analysis: Optional RAG analysis data with intelligence insights
            
        Returns:
            Dict with 'title' and 'content' keys
        """
        try:
            # Prepare context for LLM
            context = self._prepare_context(
                company_name, company_info, sme_info, relevant_articles, rag_analysis
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
        relevant_articles: List[Dict[str, Any]],
        rag_analysis: Optional[Dict[str, Any]] = None
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
        
        # Add RAG-extracted company intelligence if available
        if company_info.get('company_info'):
            company_info_data = company_info.get('company_info')
            if isinstance(company_info_data, dict) and company_info_data.get('description'):
                desc = company_info_data['description']
                if isinstance(desc, dict):
                    # Format 5-sentence description
                    sentences = [desc.get(f'sentence{i}', '') for i in range(1, 6) if desc.get(f'sentence{i}')]
                    company_context += f"- Detailed Description: {' '.join(sentences)}\n"
                else:
                    company_context += f"- Detailed Description: {desc}\n"
        
        if company_info.get('strengths'):
            strengths = company_info.get('strengths')
            if isinstance(strengths, dict) and strengths.get('strengths'):
                strength_list = strengths['strengths']
                if isinstance(strength_list, list):
                    strength_texts = [f"  • {s.get('strength', s) if isinstance(s, dict) else s}" for s in strength_list[:3]]
                    if strength_texts:
                        company_context += "- Key Strengths:\n" + "\n".join(strength_texts) + "\n"
        
        if company_info.get('opportunities'):
            opportunities = company_info.get('opportunities')
            if isinstance(opportunities, dict) and opportunities.get('opportunities'):
                opp_list = opportunities['opportunities']
                if isinstance(opp_list, list):
                    opp_texts = [f"  • {o.get('opportunity', o) if isinstance(o, dict) else o}" for o in opp_list[:3]]
                    if opp_texts:
                        company_context += "- Growth Opportunities:\n" + "\n".join(opp_texts) + "\n"
        
        # SME information
        sme_context = f"""
SME INFORMATION:
- Name: {sme_info.get('name', 'Unknown')}
- Sector: {sme_info.get('sector', 'Unknown')}
- Objectives: {sme_info.get('objective', 'No specific objectives provided')}
"""
        
        # RAG Analysis Intelligence (if available)
        rag_context = ""
        if rag_analysis:
            rag_context = "\nCOMPANY INTELLIGENCE (RAG Analysis):\n"
            
            # Latest Updates
            if rag_analysis.get('latest_updates') and rag_analysis['latest_updates'].get('data', {}).get('updates'):
                updates = rag_analysis['latest_updates']['data']['updates']
                rag_context += "- Latest Updates:\n"
                for update in updates[:3]:
                    update_text = update.get('update', '') if isinstance(update, dict) else str(update)
                    if update_text:
                        rag_context += f"  • {update_text}\n"
            
            # Challenges
            if rag_analysis.get('challenges') and rag_analysis['challenges'].get('data', {}).get('challenges'):
                challenges = rag_analysis['challenges']['data']['challenges']
                rag_context += "- Current Challenges:\n"
                for challenge in challenges[:3]:
                    challenge_text = challenge.get('challenge', '') if isinstance(challenge, dict) else str(challenge)
                    if challenge_text:
                        rag_context += f"  • {challenge_text}\n"
            
            # Decision Makers
            if rag_analysis.get('decision_makers') and rag_analysis['decision_makers'].get('data', {}).get('decision_makers'):
                decision_makers = rag_analysis['decision_makers']['data']['decision_makers']
                rag_context += "- Key Decision Makers:\n"
                for person in decision_makers[:3]:
                    name = person.get('name', '') if isinstance(person, dict) else ''
                    role = person.get('role', '') if isinstance(person, dict) else ''
                    if name:
                        rag_context += f"  • {name} ({role})\n"
            
            # Market Position
            if rag_analysis.get('market_position') and rag_analysis['market_position'].get('data'):
                mp_data = rag_analysis['market_position']['data']
                if mp_data.get('description'):
                    rag_context += f"- Market Position: {mp_data['description']}\n"
                if mp_data.get('competitors'):
                    competitors = mp_data['competitors']
                    if isinstance(competitors, list) and competitors:
                        rag_context += f"  - Competitors: {', '.join(competitors[:3])}\n"
            
            # Future Plans
            if rag_analysis.get('future_plans') and rag_analysis['future_plans'].get('data', {}).get('plans'):
                plans = rag_analysis['future_plans']['data']['plans']
                rag_context += "- Future Plans:\n"
                for plan in plans[:3]:
                    plan_text = plan.get('plan', '') if isinstance(plan, dict) else str(plan)
                    if plan_text:
                        rag_context += f"  • {plan_text}\n"
            
            # Action Plan (SME-specific engagement steps)
            if rag_analysis.get('action_plan') and rag_analysis['action_plan'].get('data', {}).get('action_steps'):
                action_steps = rag_analysis['action_plan']['data']['action_steps']
                rag_context += "\n- Recommended Engagement Steps:\n"
                for step in action_steps[:3]:
                    step_text = step.get('step', '') if isinstance(step, dict) else str(step)
                    rationale = step.get('rationale', '') if isinstance(step, dict) else ''
                    if step_text:
                        rag_context += f"  • {step_text}\n"
                        if rationale:
                            rag_context += f"    Rationale: {rationale[:100]}...\n"
            
            # Solutions (SME solutions that address company needs)
            if rag_analysis.get('solutions') and rag_analysis['solutions'].get('data', {}).get('solutions'):
                solutions = rag_analysis['solutions']['data']['solutions']
                rag_context += "\n- Relevant SME Solutions:\n"
                for solution in solutions[:3]:
                    solution_text = solution.get('solution', '') if isinstance(solution, dict) else str(solution)
                    value_prop = solution.get('value_proposition', '') if isinstance(solution, dict) else ''
                    if solution_text:
                        rag_context += f"  • {solution_text}\n"
                        if value_prop:
                            rag_context += f"    Value: {value_prop[:100]}...\n"
        
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
        
        return f"{company_context}\n{sme_context}{rag_context}\n{articles_context}"
    
    async def _generate_email_content(self, context: str) -> Dict[str, str]:
        """Generate email outreach content."""
        prompt = f"""
Based on the following comprehensive intelligence about the company and SME objectives, create a highly personalized and professional email outreach for business partnership or collaboration opportunities.

{context}

Please generate:
1. A compelling, personalized email subject line (under 60 characters)
2. A professional email body that:
   - Opens with a personalized greeting referencing a specific company update or development
   - Introduces the SME and their capabilities relevant to the company's current priorities
   - References specific recent company developments, challenges, or future plans from the intelligence
   - Highlights relevant SME solutions that address the company's current needs (if available)
   - References the recommended engagement steps (if available in the intelligence)
   - Proposes specific collaboration opportunities based on the company's strengths and opportunities
   - Mentions key decision makers if available (to demonstrate research)
   - Includes a clear, action-oriented call-to-action
   - Maintains a professional but engaging, personalized tone
   - Is concise (150-200 words)
   - Shows genuine understanding of the company's business context

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
Based on the following comprehensive intelligence about the company and SME objectives, create a highly personalized call script for business outreach.

{context}

Please generate:
1. A brief call title/purpose (personalized to the company)
2. A structured call script that includes:
   - Opening introduction (30 seconds) - personalized opener referencing a specific company update
   - Company research talking points - reference latest updates, challenges, or future plans from intelligence
   - Value proposition presentation - highlight relevant SME solutions that address company's current needs
   - Decision maker engagement - mention key decision makers if available to show research
   - Personalized questions to ask the prospect based on their challenges and opportunities
   - Partnership opportunities discussion - reference company strengths and how SME can help
   - Closing and next steps - use recommended engagement steps if available
   - Objection handling tips - address common concerns based on company's market position

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
Based on the following comprehensive intelligence about the company and SME objectives, create a professional and strategic meeting agenda for business partnership discussion.

{context}

Please generate:
1. A personalized meeting title that reflects the partnership opportunity
2. A detailed meeting agenda that includes:
   - Meeting objectives (specific to company's current priorities and challenges)
   - Attendee recommendations (reference key decision makers if available)
   - Agenda items with time allocations:
     * Company overview discussion (reference company strengths and opportunities)
     * Recent developments review (latest updates and future plans)
     * Challenge identification (discuss current challenges from intelligence)
     * SME capabilities presentation (highlight relevant solutions from intelligence)
     * Partnership opportunity exploration (based on engagement steps if available)
     * Collaboration framework discussion
   - Discussion points about recent company developments, challenges, and opportunities
   - Partnership opportunity exploration based on company's future plans
   - Action items and next steps (aligned with recommended engagement steps)
   - Meeting duration estimate (typically 60-90 minutes)

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
                    "num_predict": 1000  # Ollama uses num_predict instead of max_tokens
                }
            }
            
            # Try multiple URLs in case of DNS/hostname issues
            # First try the configured URL, then fallback to localhost or ollama
            urls_to_try = [self.ollama_url]
            
            # Extract hostname and port to build fallback URLs (matching RAG service logic)
            url_match = re.match(r'(https?://)([^:/]+)(:\d+)?(/.*)?$', self.ollama_url)
            if url_match:
                protocol, hostname, port, path = url_match.groups()
                port = port or ':11434'  # Default Ollama port
                path = path or ''
                
                # If configured URL uses 'ollama' hostname (Docker), also try 'localhost'
                if 'ollama' in hostname and 'localhost' not in hostname:
                    localhost_url = f"{protocol}localhost{port}{path}"
                    urls_to_try.append(localhost_url)
                # If configured URL uses 'localhost', also try 'ollama' (for Docker)
                elif 'localhost' in hostname and 'ollama' not in hostname:
                    ollama_url = f"{protocol}ollama{port}{path}"
                    urls_to_try.append(ollama_url)
            
            # Use requests (synchronous) in a thread pool to avoid blocking
            # This matches how RAG service connects to Ollama successfully
            def _make_request(url):
                with requests.Session() as session:
                    api_url = f"{url}/api/generate"
                    logger.debug(f"Trying Ollama at: {api_url}")
                    # Use longer timeout for LLM generation (120s like RAG service)
                    # Connection timeout: 10s, Read timeout: 120s
                    response = session.post(
                        api_url,
                        json=payload,
                        timeout=(10, 120)  # (connect timeout, read timeout)
                    )
                    if response.status_code == 200:
                        logger.debug(f"✅ Successfully connected to Ollama at: {url}")
                        return response.json()
                    else:
                        raise Exception(f"LLM API returned status {response.status_code}")
            
            # Try each URL until one works
            last_error = None
            generated_text = None
            for url in urls_to_try:
                try:
                    logger.info(f"Calling Ollama at: {url}/api/generate")
                    
                    # Run the synchronous request in a thread pool
                    result = await asyncio.to_thread(_make_request, url)
                    generated_text = result.get('response', '')
                    break  # Success, exit the loop
                except requests.exceptions.ConnectTimeout as e:
                    last_error = e
                    logger.warning(f"Connection timeout to {url}, trying next URL...")
                    continue
                except requests.exceptions.ReadTimeout as e:
                    last_error = e
                    logger.warning(f"Read timeout from {url}, trying next URL...")
                    continue
                except requests.exceptions.ConnectionError as e:
                    last_error = e
                    logger.warning(f"Failed to connect to {url}, trying next URL...")
                    continue
                except Exception as e:
                    last_error = e
                    logger.warning(f"Error connecting to {url}: {e}, trying next URL...")
                    continue
            
            if generated_text is None:
                # All URLs failed
                error_msg = f"All Ollama connection attempts failed. Last error: {last_error}"
                logger.error(error_msg)
                logger.error(f"Tried URLs: {urls_to_try}")
                raise Exception(error_msg)
            
            # Try to parse JSON response
            try:
                # Look for JSON in the response
                start_idx = generated_text.find('{')
                end_idx = generated_text.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = generated_text[start_idx:end_idx]
                    parsed_content = json.loads(json_str)
                    
                    # Extract title and content
                    title = parsed_content.get("title", "")
                    content = parsed_content.get("content", generated_text)
                    
                    # Always extract title from content for emails
                    if outreach_type == "email":
                        # Title from LLM response should be the email subject
                        # If it's generic, try to extract from content
                        title_lower = title.lower() if title else ""
                        is_generic = (
                            not title or 
                            'email outreach' in title_lower or 
                            'generated email outreach' in title_lower or 
                            'generated outreach' in title_lower or
                            title_lower == 'email outreach' or
                            title_lower == 'outreach'
                        )
                        
                        if is_generic and '"title"' in str(content):
                            # Try to extract subject from content JSON
                            match = re.search(r'"title"\s*:\s*"((?:[^"\\]|\\.)*)"', str(content))
                            if match:
                                extracted_title = match.group(1)
                                # Unescape JSON string
                                extracted_title = extracted_title.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t').replace('\\r', '\r').replace('\\\\', '\\')
                                if extracted_title.strip() and 'email outreach' not in extracted_title.lower():
                                    title = extracted_title.strip()
                            
                            # If still generic, try simpler regex
                            if not title or 'email outreach' in title.lower():
                                match = re.search(r'"title"\s*:\s*"([^"]+)"', str(content))
                                if match:
                                    extracted_title = match.group(1).strip()
                                    if extracted_title and 'email outreach' not in extracted_title.lower():
                                        title = extracted_title
                    elif not title or (title.lower().startswith('generated') and 'outreach' in title.lower()):
                        title = f"{outreach_type.title()} Outreach"
                    
                    return {
                        "title": title,
                        "content": content
                    }
            except json.JSONDecodeError:
                logger.warning(f"Could not parse JSON from LLM response for {outreach_type}")
            
            # Fallback: use the entire response as content
            # Try to extract subject from the text
            fallback_title = f"{outreach_type.title()} Outreach"
            if outreach_type == "email":
                # Try to find subject line in the text
                subject_match = re.search(r'(?:subject|title)[\s:]+["\']?([^"\'\n]+)["\']?', generated_text, re.IGNORECASE)
                if subject_match:
                    fallback_title = subject_match.group(1).strip()
            
            return {
                "title": fallback_title,
                "content": generated_text
            }
                        
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error calling LLM for {outreach_type}: {str(e)}")
            logger.error(f"Ollama URL was: {self.ollama_url}")
            raise Exception(f"Failed to connect to Ollama service at {self.ollama_url}. Please ensure Ollama is running and accessible.")
        except requests.exceptions.Timeout as e:
            logger.error(f"Timeout calling LLM for {outreach_type}: {str(e)}")
            logger.error(f"Ollama URL was: {self.ollama_url}")
            raise Exception(f"Timeout connecting to Ollama service at {self.ollama_url}.")
        except Exception as e:
            logger.error(f"Error calling LLM for {outreach_type}: {str(e)}")
            logger.error(f"Ollama URL was: {self.ollama_url}")
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
