"""
Outreach Service for generating tailored email, call, and meeting content
based on SME objectives and company articles.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import re
import asyncio
from ..models import OutreachType

logger = logging.getLogger(__name__)

class OutreachService:
    def __init__(self):
        # Initialize LLM service (llama.cpp with Phi-3.5 Mini)
        from app.services.llm_service import get_llm_service
        self.llm_service = get_llm_service()
        
        if not self.llm_service.is_available():
            logger.warning("⚠️ LLM service not available. Outreach generation will fail.")
        else:
            logger.info("✅ OutreachService initialized with Phi-3.5 Mini (llama.cpp)")
        
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
        
        # Our organization information
        our_org_context = f"""
OUR ORGANIZATION INFORMATION:
- Name: {sme_info.get('name', 'Unknown')}
- Sector: {sme_info.get('sector', 'Unknown')}
- Capabilities and Objectives: {sme_info.get('objective', 'Partnership and collaboration focused')}
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
            
            # Action Plan (recommended engagement steps for partnership)
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
            
            # Solutions (collaboration opportunities that address company needs)
            if rag_analysis.get('solutions') and rag_analysis['solutions'].get('data', {}).get('solutions'):
                solutions = rag_analysis['solutions']['data']['solutions']
                rag_context += "\n- Relevant Collaboration Opportunities:\n"
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
        
        return f"{company_context}\n{our_org_context}{rag_context}\n{articles_context}"
    
    async def _generate_email_content(self, context: str) -> Dict[str, str]:
        """Generate email outreach content."""
        prompt = f"""
Based on the following comprehensive intelligence about the company, create a highly personalized and professional email outreach for strategic partnership and collaboration opportunities.

{context}

Please generate:
1. A compelling, personalized email subject line (under 60 characters)
2. A professional email body that:
   - Opens with a personalized greeting referencing a specific company update or development
   - Introduces our organization and capabilities relevant to the company's current priorities
   - Demonstrates understanding of the company's recent developments, challenges, and growth trajectory
   - Highlights specific collaboration opportunities that create mutual value
   - Explains how both organizations can benefit from working together:
     * What value we bring to support the company's current priorities and future plans
     * How the company's strengths and opportunities align with our capabilities
     * The mutual growth potential from this strategic partnership
   - References key decision makers if available (to demonstrate research and respect)
   - Emphasizes partnership, collaboration, and shared success rather than one-sided benefits
   - Proposes concrete next steps for exploring collaboration
   - Maintains a professional, respectful, and partnership-focused tone
   - Is concise (150-200 words)
   - Shows genuine understanding of the company's business context and growth aspirations

IMPORTANT NOTES:
- Do NOT refer to either organization as "SME" or any diminutive term
- Respect the company's position and reputation
- Focus on strategic partnership and mutual benefits
- Emphasize collaboration and shared growth opportunities

IMPORTANT: You MUST respond with ONLY valid JSON, no additional text or explanations. Format your response as JSON:

{{
    "title": "Email subject line here",
    "content": "Email body content here"
}}

Return ONLY the JSON object, nothing else.
"""
        
        return await self._call_llm(prompt, "email")
    
    async def _generate_call_content(self, context: str) -> Dict[str, str]:
        """Generate call script content."""
        prompt = f"""
Based on the following comprehensive intelligence about the company, create a highly personalized call script for strategic partnership outreach.

{context}

Please generate:
1. A brief call title/purpose (personalized to the company)
2. A structured call script that includes:
   - Opening introduction (30 seconds) - personalized opener referencing a specific company update
   - Company research talking points - reference latest updates, challenges, growth plans from intelligence
   - Collaboration opportunities presentation - highlight how both organizations can work together
   - Mutual benefits discussion:
     * How our capabilities support the company's current priorities and future growth
     * How the company's strengths complement our offerings
     * The growth potential for both organizations through partnership
   - Decision maker engagement - mention key decision makers if available to show research and respect
   - Personalized questions to explore collaboration opportunities based on company's challenges and growth plans
   - Strategic partnership discussion - focus on how both parties can grow together
   - Closing and next steps - propose concrete ways to explore collaboration
   - Objection handling tips - address concerns with mutual benefit focus

IMPORTANT NOTES:
- Do NOT refer to either organization as "SME" or any diminutive term
- Respect the company's position and focus on partnership
- Emphasize collaboration and mutual growth opportunities

IMPORTANT: You MUST respond with ONLY valid JSON, no additional text or explanations. Format your response as JSON:

{{
    "title": "Call purpose/title here",
    "content": "Structured call script here"
}}

Return ONLY the JSON object, nothing else.
"""
        
        return await self._call_llm(prompt, "call")
    
    async def _generate_meeting_content(self, context: str) -> Dict[str, str]:
        """Generate meeting agenda content."""
        prompt = f"""
Based on the following comprehensive intelligence about the company, create a professional and strategic meeting agenda for partnership and collaboration discussion.

{context}

Please generate:
1. A personalized meeting title that reflects the strategic partnership opportunity
2. A detailed meeting agenda that includes:
   - Meeting objectives (focus on exploring mutual collaboration and growth opportunities)
   - Attendee recommendations (reference key decision makers if available)
   - Agenda items with time allocations:
     * Company overview discussion (reference company strengths, opportunities, and growth trajectory)
     * Recent developments review (latest updates and future growth plans)
     * Challenge and opportunity identification (discuss current priorities from intelligence)
     * Our capabilities presentation (highlight how we can support the company's growth)
     * Collaboration opportunities exploration:
       - How both organizations can work together
       - Mutual benefits and value creation
       - Growth potential for both parties
     * Partnership framework discussion (how to structure collaboration)
   - Discussion points about:
     * Recent company developments and growth initiatives
     * Alignment between our capabilities and company's priorities
     * Specific collaboration opportunities that create mutual value
     * Growth potential for both organizations through partnership
   - Action items and next steps (concrete ways to move forward together)
   - Meeting duration estimate (typically 60-90 minutes)

IMPORTANT NOTES:
- Do NOT refer to either organization as "SME" or any diminutive term
- Respect the company's position and emphasize partnership
- Focus on collaboration, mutual benefits, and shared growth

IMPORTANT: You MUST respond with ONLY valid JSON, no additional text or explanations. Format your response as JSON:

{{
    "title": "Meeting title here",
    "content": "Detailed meeting agenda here"
}}

Return ONLY the JSON object, nothing else.
"""
        
        return await self._call_llm(prompt, "meeting")
    
    async def _call_llm(self, prompt: str, outreach_type: str) -> Dict[str, str]:
        """Call Phi-3.5 Mini via llama.cpp to generate content."""
        try:
            # System message for outreach generation
            system_message = f"""You are a professional business outreach assistant specializing in strategic partnerships. Generate personalized {outreach_type} content that emphasizes collaboration, mutual benefits, and shared growth opportunities. Always maintain respect for the company and never use diminutive terms like "SME". Always return valid JSON with 'title' and 'content' fields."""
            
            # Use LLM service for direct inference (run in thread pool for async compatibility)
            def _generate():
                return self.llm_service.generate(
                    prompt=prompt,
                    system_message=system_message,
                    temperature=0.7,
                    max_tokens=1000,
                    stop=["<|end|>", "</s>", "\n\n\n"]
                )
            
            # Run in thread pool to avoid blocking
            generated_text = await asyncio.to_thread(_generate)
            
            if not generated_text:
                raise Exception("LLM returned empty response")
            
            logger.info(f"✅ Successfully generated {outreach_type} content (length: {len(generated_text)})")
            
            # Try to parse JSON response
            try:
                # Clean the response - remove markdown code blocks if present
                cleaned_text = generated_text.strip()
                
                # Remove markdown code blocks
                if cleaned_text.startswith('```'):
                    # Extract content between ```json and ```
                    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', cleaned_text, re.DOTALL)
                    if json_match:
                        cleaned_text = json_match.group(1)
                    else:
                        # Try to find JSON without language tag
                        json_match = re.search(r'```\s*(\{.*?\})\s*```', cleaned_text, re.DOTALL)
                        if json_match:
                            cleaned_text = json_match.group(1)
                
                # Look for JSON in the response
                start_idx = cleaned_text.find('{')
                end_idx = cleaned_text.rfind('}') + 1
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    json_str = cleaned_text[start_idx:end_idx]
                    # Try to parse the JSON
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
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Could not parse JSON from LLM response for {outreach_type}: {e}")
                logger.debug(f"Generated text was: {generated_text[:200]}...")
            
            # Fallback: use the entire response as content
            # Try to extract subject/title from the text if it's plain text
            fallback_title = f"{outreach_type.title()} Outreach"
            fallback_content = generated_text.strip()
            
            if outreach_type == "email":
                # Try to find subject line in the text
                # Look for patterns like "Subject: ..." or "Title: ..." or first line if it looks like a subject
                subject_patterns = [
                    r'(?:subject|title)[\s:]+["\']?([^"\'\n]+)["\']?',
                    r'^([^:\n]{5,60})$',  # First line that looks like a subject (5-60 chars)
                ]
                
                for pattern in subject_patterns:
                    subject_match = re.search(pattern, generated_text, re.IGNORECASE | re.MULTILINE)
                if subject_match:
                        potential_title = subject_match.group(1).strip()
                        if potential_title and len(potential_title) > 5:
                            fallback_title = potential_title
                            # Remove the title from content if it's on first line
                            fallback_content = re.sub(f'^{re.escape(potential_title)}\\s*\n?', '', fallback_content, flags=re.IGNORECASE | re.MULTILINE).strip()
                            break
                
                # If response is very short and looks like just a subject line, use it as title
                if len(fallback_content) < 100 and not '\n' in fallback_content:
                    fallback_title = fallback_content
                    fallback_content = "I hope this email finds you well. I'm reaching out to explore potential partnership opportunities between our organizations."
            
            return {
                "title": fallback_title,
                "content": fallback_content if fallback_content else generated_text
            }
                        
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
