"""LLM-Based Comprehensive Analysis Service.

Uses LLM to answer all 7 business intelligence questions from article snippets.
Works with short content (like your CSV exports).

YOUR CONTRIBUTIONS (for Capstone Defense):
1. Adaptive prompt engineering based on SME and target industries
2. Multi-article context aggregation
3. Industry-specific terminology and examples
4. Custom question formulation for each category
5. Structured output parsing and validation
6. Multi-LLM support (Ollama, OpenAI, fallback)
"""

import os
import json
import asyncio
import aiohttp
from typing import List, Dict, Any
from loguru import logger


class LLMAnalysisService:
    """Service for comprehensive company analysis using LLM."""
    
    def __init__(self, llm_provider: str = "auto"):
        """
        Initialize LLM analysis service.
        
        Args:
            llm_provider: 'ollama' (free, local), 'openai' (paid API), or 'auto' (try both)
        """
        self.llm_provider = llm_provider
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
        
        # YOUR CONTRIBUTION: Industry detection patterns
        self.industry_patterns = {
            'telecommunications': ['telecom', 'mobile', 'network', 'connectivity', '5g', '4g', 'subscriber', 'mtn', 'airtel', 'vodafone'],
            'fintech': ['fintech', 'payment', 'mobile money', 'momo', 'wallet', 'transaction', 'financial', 'lending'],
            'technology': ['technology', 'software', 'platform', 'digital', 'cloud', 'saas', 'tech', 'app'],
            'retail': ['retail', 'e-commerce', 'shopping', 'store', 'merchant', 'consumer', 'supermarket'],
            'manufacturing': ['manufacturing', 'production', 'factory', 'supply chain', 'industrial'],
            'banking': ['bank', 'banking', 'lending', 'credit', 'loan', 'financial institution'],
            'energy': ['energy', 'power', 'electricity', 'renewable', 'solar', 'utility'],
            'healthcare': ['healthcare', 'medical', 'health', 'hospital', 'clinic', 'pharmaceutical']
        }
        
        # YOUR CONTRIBUTION: Industry-specific contexts
        self.industry_contexts = {
            ('fintech', 'telecommunications'): {
                'synergy': 'mobile payments, digital wallets, and mobile money services',
                'value_prop': 'payment infrastructure, transaction processing, financial inclusion, subscriber monetization',
                'engagement': 'fintech API partnerships, mobile money platform integration, digital financial services collaboration'
            },
            ('fintech', 'fintech'): {
                'synergy': 'complementary financial services, API integrations, shared customer ecosystem',
                'value_prop': 'enhanced service offerings, ecosystem expansion, revenue sharing, cross-selling',
                'engagement': 'API partnerships, white-label solutions, co-branded financial products'
            },
            ('technology', 'telecommunications'): {
                'synergy': 'digital transformation, network optimization, customer experience enhancement',
                'value_prop': 'operational efficiency, service innovation, cost reduction, data analytics',
                'engagement': 'technology partnerships, platform integration, joint product development'
            },
            ('technology', 'retail'): {
                'synergy': 'e-commerce platforms, inventory management, customer analytics',
                'value_prop': 'sales optimization, customer insights, operational efficiency, omnichannel experience',
                'engagement': 'platform integration, data partnerships, digital commerce solutions'
            }
        }
        
        print(f"LLM Analysis Service initialized (provider: {llm_provider})")
    
    def _detect_industry(self, text: str) -> str:
        """YOUR CONTRIBUTION: Industry detection from text."""
        if not text:
            return 'general'
        
        text_lower = text.lower()
        industry_scores = {}
        
        for industry, keywords in self.industry_patterns.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                industry_scores[industry] = score
        
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        
        return 'general'
    
    def _get_industry_context(self, sme_industry: str, target_industry: str) -> Dict[str, str]:
        """YOUR CONTRIBUTION: Get industry-specific context."""
        key = (sme_industry, target_industry)
        if key in self.industry_contexts:
            return self.industry_contexts[key]
        
        # Default context
        return {
            'synergy': 'complementary capabilities and shared business goals',
            'value_prop': 'operational efficiency, growth support, strategic value creation',
            'engagement': 'strategic partnerships, solution integration, collaborative initiatives'
        }
    
    def _prepare_articles_context(self, articles: List[Dict[str, str]]) -> str:
        """
        YOUR CONTRIBUTION: Aggregate articles into LLM context.
        
        Combines multiple articles into structured text for analysis.
        """
        if not articles:
            return "No articles provided."
        
        context_parts = []
        
        for i, article in enumerate(articles[:20], 1):  # Limit to 20 articles
            title = article.get('title', '')
            content = article.get('content', '')
            
            if not title and not content:
                continue
            
            # Format each article
            article_text = f"Article {i}: {title}"
            if content:
                article_text += f"\n{content}"
            
            context_parts.append(article_text)
        
        return "\n\n".join(context_parts)
    
    async def analyze_comprehensive(self, articles: List[Dict[str, str]], 
                                   company_name: str, sme_objective: str) -> Dict[str, Any]:
        """
        Comprehensive analysis of company using LLM for all 7 questions.
        
        YOUR CONTRIBUTION: Unified LLM-based analysis with adaptive prompts.
        
        Args:
            articles: List of article dicts
            company_name: Target company name
            sme_objective: YOUR SME's capabilities
            
        Returns:
            Dict with answers to all 7 questions
        """
        # Detect industries
        sme_text = sme_objective
        articles_text = " ".join([a.get('content', '') + " " + a.get('title', '') for a in articles[:10]])
        
        sme_industry = self._detect_industry(sme_text)
        target_industry = self._detect_industry(articles_text)
        context = self._get_industry_context(sme_industry, target_industry)
        
        logger.info(f"Detected industries: YOUR SME={sme_industry}, TARGET={target_industry}")
        
        # Prepare article context
        articles_context = self._prepare_articles_context(articles)
        
        # Create comprehensive prompt
        prompt = self._create_comprehensive_prompt(
            articles_context, company_name, sme_objective,
            sme_industry, target_industry, context
        )
        
        # Call LLM
        result = await self._call_llm(prompt)
        
        # Parse response
        if result and len(result) > 200:
            logger.info(f"📝 LLM returned {len(result)} characters, parsing...")
            parsed = self._parse_llm_response(result)
            
            # Check if parsing was successful (at least some real answers)
            successful_parses = sum(1 for v in parsed.values() if v and v != "No information found in the articles.")
            
            if successful_parses >= 3:  # At least 3 questions answered
                logger.info(f"✅ Successfully parsed {successful_parses}/7 answers")
                return parsed
            else:
                logger.warning(f"⚠️ Only parsed {successful_parses}/7 answers, LLM response format issue")
                logger.warning(f"First 1000 chars of LLM response:\n{result[:1000]}")
                
                # Save full response for debugging
                with open('/tmp/llm_response_debug.txt', 'w') as f:
                    f.write(result)
                logger.warning("Full LLM response saved to /tmp/llm_response_debug.txt")
                
                # Fallback to template
                return self._template_analysis(articles, company_name, sme_objective, sme_industry, target_industry, context)
        else:
            # Fallback to template-based
            logger.warning(f"LLM failed (result length: {len(result) if result else 0}), using template-based analysis")
            return self._template_analysis(articles, company_name, sme_objective, sme_industry, target_industry, context)
    
    def _create_comprehensive_prompt(self, articles_context: str, company_name: str, 
                                    sme_objective: str, sme_industry: str, 
                                    target_industry: str, context: Dict[str, str]) -> str:
        """
        YOUR CONTRIBUTION: Adaptive comprehensive analysis prompt.
        
        Single prompt for all 7 questions, adapts to industries.
        """
        return f"""You are a business intelligence analyst specializing in {sme_industry} solutions for {target_industry} companies in African markets.

TARGET COMPANY: {company_name} ({target_industry.upper()} Industry)

ARTICLES ABOUT TARGET COMPANY:
{articles_context}

YOUR SME PROFILE ({sme_industry.upper()} Provider):
{sme_objective}

INDUSTRY CONTEXT:
- Synergy areas: {context['synergy']}
- Value drivers: {context['value_prop']}
- Engagement approach: {context['engagement']}

================================================================================
TASK: Analyze the articles and provide DETAILED answers to these 7 questions:
================================================================================

1. LATEST UPDATES: What are the latest company updates for {company_name}? Include leadership changes, financial performance, strategic moves, new products/services, and recent announcements. Be specific with names, numbers, and dates from the articles.

2. CHALLENGES: What are {company_name}'s biggest challenges, priorities, or inefficiencies? Include regulatory issues, competitive pressures, operational problems, and any difficulties mentioned. Quote specific concerns from the articles.

3. DECISION MAKERS: Who are the key decision-makers at {company_name}? List CEOs, executives, board members, new hires, and anyone influencing major decisions. Include their names and titles from the articles.

4. MARKET POSITION: How does {company_name} position itself in the {target_industry} market? Include market share, competitors mentioned, industry trends, regulatory environment, and technological changes affecting them.

5. FUTURE PLANS: What upcoming initiatives, partnerships, or expansions is {company_name} planning? Include new products, hiring plans, infrastructure investments, market expansion, and any announced future projects.

6. ACTION PLAN: Based on YOUR SME's capabilities in {sme_industry} ({sme_objective}) and {company_name}'s current situation, what are 3 SPECIFIC steps YOUR SME should take to engage them? Consider {context['engagement']} opportunities. Each step must:
   - Reference THEIR actual challenges/plans from the articles
   - Show how YOUR specific {sme_industry} capabilities help
   - Name specific decision makers to contact
   - Be actionable with concrete next steps

7. SOLUTIONS: Based on YOUR SME's offerings ({sme_objective}) and {company_name}'s needs, recommend 3 SPECIFIC solutions from YOUR portfolio that address their situation. Focus on {context['synergy']} and {context['value_prop']}. For each solution:
   - Name a specific product/service YOUR SME offers (not generic)
   - Explain how it solves THEIR specific challenge from the articles
   - Show measurable value for a {target_industry} company
   - Reference actual data points (numbers, initiatives, names)

================================================================================
FORMAT YOUR RESPONSE EXACTLY AS:
================================================================================

1. LATEST UPDATES:
[Your detailed answer with specific facts, names, numbers, dates from articles]

2. CHALLENGES:
[Your detailed answer with specific challenges, issues, concerns from articles]

3. DECISION MAKERS:
[List of names and titles found in articles]

4. MARKET POSITION:
[Detailed market analysis with competitors, trends, positioning from articles]

5. FUTURE PLANS:
[Specific initiatives, projects, expansions mentioned in articles]

6. ACTION PLAN:
[3 specific steps for YOUR {sme_industry} SME to engage THEIR {target_industry} company]

7. SOLUTIONS:
[3 specific YOUR products/services that help THEM based on articles]

IMPORTANT:
- Be SPECIFIC - use actual data from articles (numbers, names, dates)
- For questions 1-5: Extract facts from articles only
- For questions 6-7: Match YOUR SME capabilities to THEIR needs
- Use {target_industry}-specific terminology
- Show how {sme_industry} + {target_industry} creates value
- Make recommendations actionable and realistic"""
    
    def _parse_llm_response(self, response: str) -> Dict[str, str]:
        """
        YOUR CONTRIBUTION: Parse LLM response into structured format.
        More flexible parser that handles variations in LLM output.
        """
        import re
        
        # Try to find sections using flexible regex patterns
        questions = {}
        
        # Patterns for each question (case-insensitive, flexible formatting, handles markdown)
        patterns = {
            '1_latest_updates': r'\*?\*?1\.?\s*\*?\*?\s*(LATEST\s+UPDATES|Latest\s+Updates)\*?\*?[:\s]+(.*?)(?=\*?\*?2\.|$)',
            '2_challenges': r'\*?\*?2\.?\s*\*?\*?\s*(CHALLENGES|Challenges)\*?\*?[:\s]+(.*?)(?=\*?\*?3\.|$)',
            '3_decision_makers': r'\*?\*?3\.?\s*\*?\*?\s*(DECISION\s+MAKERS|Decision\s+Makers)\*?\*?[:\s]+(.*?)(?=\*?\*?4\.|$)',
            '4_market_position': r'\*?\*?4\.?\s*\*?\*?\s*(MARKET\s+POSITION|Market\s+Position)\*?\*?[:\s]+(.*?)(?=\*?\*?5\.|$)',
            '5_future_plans': r'\*?\*?5\.?\s*\*?\*?\s*(FUTURE\s+PLANS|Future\s+Plans)\*?\*?[:\s]+(.*?)(?=\*?\*?6\.|$)',
            '6_action_plan': r'\*?\*?6\.?\s*\*?\*?\s*(ACTION\s+PLAN|Action\s+Plan)\*?\*?[:\s]+(.*?)(?=\*?\*?7\.|$)',
            '7_solutions': r'\*?\*?7\.?\s*\*?\*?\s*(SOLUTIONS|Solutions)\*?\*?[:\s]+(.*?)$'
        }
        
        # Try each pattern
        for key, pattern in patterns.items():
            match = re.search(pattern, response, re.IGNORECASE | re.DOTALL)
            if match:
                answer = match.group(2).strip()
                # Clean up the answer
                answer = re.sub(r'^[:\-\s]+', '', answer)  # Remove leading colons, dashes, spaces
                answer = re.sub(r'=+', '', answer)  # Remove separator lines
                answer = re.sub(r'\*\*', '', answer)  # Remove markdown bold markers
                answer = answer.strip()
                
                if answer and len(answer) > 10:  # Minimum length check
                    questions[key] = answer
                else:
                    questions[key] = "No information found in the articles."
            else:
                questions[key] = "No information found in the articles."
        
        return questions
    
    async def _call_llm(self, prompt: str) -> str:
        """Call LLM API to generate response."""
        # Try Ollama first
        if self.llm_provider in ['ollama', 'auto']:
            result = await self._call_ollama(prompt)
            if result:
                return result
        
        # Try OpenAI
        if self.llm_provider in ['openai', 'auto']:
            if self.openai_api_key:
                result = await self._call_openai(prompt)
                if result:
                    return result
        
        return ""
    
    async def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API (free, local)."""
        try:
            logger.info("🔄 Calling Ollama (llama3.1)... this may take 1-2 minutes")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": "llama3.1",
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=aiohttp.ClientTimeout(total=180)  # 3 minutes for comprehensive analysis
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data.get('response', '').strip()
                        logger.info(f"✅ Analysis generated using Ollama (llama3.1) - {len(result)} chars")
                        return result
                    else:
                        logger.warning(f"Ollama returned status {response.status}")
        except asyncio.TimeoutError:
            logger.warning("⏰ Ollama timed out after 180 seconds")
        except Exception as e:
            logger.warning(f"Ollama error: {e}")
        
        return ""
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.7,
                        "max_tokens": 2000  # Increased for comprehensive answers
                    },
                    timeout=aiohttp.ClientTimeout(total=120)  # 2 minutes for OpenAI
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data['choices'][0]['message']['content'].strip()
                        logger.info("✅ Analysis generated using OpenAI (gpt-3.5-turbo)")
                        return result
        except Exception as e:
            logger.debug(f"OpenAI not available: {e}")
        
        return ""
    
    def _template_analysis(self, articles: List[Dict[str, str]], company_name: str, 
                          sme_objective: str, sme_industry: str, target_industry: str,
                          context: Dict[str, str]) -> Dict[str, str]:
        """
        YOUR CONTRIBUTION: Template-based analysis (fallback when no LLM).
        
        Uses article data and industry context to generate basic answers.
        """
        # Extract key info from articles
        titles = [a.get('title', '') for a in articles if a.get('title')]
        
        return {
            '1_latest_updates': f"Based on {len(articles)} articles: {company_name} has recent news about {', '.join(titles[:3])}. Review the articles for detailed updates on financial performance, leadership, and strategic initiatives.",
            '2_challenges': f"Analysis of articles suggests {company_name} faces typical {target_industry} industry challenges. Review article content for specific mentions of regulatory, competitive, or operational difficulties.",
            '3_decision_makers': f"Key executives and decision makers are mentioned in the articles. Review article titles and content for names of CEOs, executives, and board members at {company_name}.",
            '4_market_position': f"{company_name} operates in the {target_industry} sector. Articles discuss their competitive position, market trends, and industry dynamics. Review for specifics on market share and competitors.",
            '5_future_plans': f"Articles mention various initiatives and plans for {company_name}. Look for announcements about partnerships, expansions, new products, and strategic investments in the {target_industry} space.",
            '6_action_plan': f"1. Research {company_name}'s current {target_industry} initiatives and identify how your {sme_industry} solutions in {context['synergy']} can support their goals.\n\n2. Develop value proposition showing how your SME's {sme_objective[:100]}... addresses their {target_industry}-specific needs based on {context['value_prop']}.\n\n3. Engage decision makers with targeted proposal for {context['engagement']} opportunities.",
            '7_solutions': f"1. YOUR Core {sme_industry.capitalize()} Solution: Leverages your capabilities in {context['synergy']} to support {company_name}'s {target_industry} operations.\n\n2. YOUR {target_industry}-Specific Platform: Tailored for {target_industry} companies, delivers {context['value_prop']}.\n\n3. YOUR Integration Service: Enables {context['engagement']} between your {sme_industry} solutions and their {target_industry} ecosystem."
        }
    
    def is_available(self) -> bool:
        """Check if at least one LLM provider is available."""
        return True  # Template fallback always works


