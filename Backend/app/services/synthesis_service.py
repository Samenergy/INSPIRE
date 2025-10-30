
import os
import json
from typing import List, Dict, Any, Optional
import aiohttp
from loguru import logger

class SynthesisService:

    def __init__(self, llm_provider: str = "auto"):
        self.llm_provider = llm_provider
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')

        self.industry_patterns = {
            'telecommunications': ['telecom', 'mobile', 'network', 'connectivity', '5g', '4g', 'subscriber'],
            'fintech': ['fintech', 'payment', 'mobile money', 'momo', 'wallet', 'transaction', 'financial'],
            'technology': ['technology', 'software', 'platform', 'digital', 'cloud', 'saas', 'tech'],
            'retail': ['retail', 'e-commerce', 'shopping', 'store', 'merchant', 'consumer'],
            'manufacturing': ['manufacturing', 'production', 'factory', 'supply chain', 'industrial'],
            'banking': ['bank', 'banking', 'lending', 'credit', 'loan', 'financial institution'],
            'energy': ['energy', 'power', 'electricity', 'renewable', 'solar', 'utility'],
            'healthcare': ['healthcare', 'medical', 'health', 'hospital', 'clinic', 'pharmaceutical']
        }

        print(f"Synthesis Service initialized (provider: {llm_provider})")

    def _detect_industry(self, text: str) -> str:
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
        contexts = {
            ('fintech', 'telecommunications'): {
                'synergy': 'mobile payments, digital wallets, and fintech services',
                'value_prop': 'payment infrastructure, transaction processing, financial inclusion',
                'engagement': 'fintech partnerships, mobile money integration, digital financial services'
            },
            ('fintech', 'fintech'): {
                'synergy': 'complementary financial services, API integrations, shared customer base',
                'value_prop': 'enhanced service offerings, ecosystem expansion, revenue sharing',
                'engagement': 'API partnerships, white-label solutions, co-branded products'
            },
            ('technology', 'telecommunications'): {
                'synergy': 'digital transformation, network optimization, customer experience',
                'value_prop': 'operational efficiency, service innovation, cost reduction',
                'engagement': 'technology partnerships, platform integration, joint innovation'
            },
            ('technology', 'retail'): {
                'synergy': 'e-commerce platforms, inventory management, customer analytics',
                'value_prop': 'sales optimization, customer insights, operational efficiency',
                'engagement': 'platform integration, data partnerships, omnichannel solutions'
            }
        }

        key = (sme_industry, target_industry)
        if key in contexts:
            return contexts[key]

        return {
            'synergy': 'complementary capabilities and shared goals',
            'value_prop': 'operational efficiency, growth support, strategic value',
            'engagement': 'strategic partnerships, solution integration, collaborative initiatives'
        }

    async def generate_action_plan(self, company_data: Dict[str, Any], company_name: str, sme_objective: str) -> str:
        prompt = self._create_action_plan_prompt(company_data, company_name, sme_objective)

        result = await self._call_llm(prompt)

        if not result or len(result) < 100:
            result = self._template_action_plan(company_data, company_name, sme_objective)

        return result

    async def generate_solutions(self, company_data: Dict[str, Any], company_name: str, sme_objective: str) -> str:
        prompt = self._create_solutions_prompt(company_data, company_name, sme_objective)

        result = await self._call_llm(prompt)

        if not result or len(result) < 100:
            result = self._template_solutions(company_data, company_name, sme_objective)

        return result

    def _create_action_plan_prompt(self, company_data: Dict[str, Any], company_name: str, sme_objective: str) -> str:
        sme_text = sme_objective
        target_text = f"{company_data.get('latest_updates', '')} {company_data.get('market_position', '')} {company_data.get('future_plans', '')}"

        sme_industry = self._detect_industry(sme_text)
        target_industry = self._detect_industry(target_text)

        context = self._get_industry_context(sme_industry, target_industry)

        return f"""You are a B2B partnership strategist specializing in {sme_industry} solutions for {target_industry} companies in Africa.

TARGET COMPANY: {company_name} ({target_industry.upper()} industry)

Target Company Intelligence:
- Latest Updates: {company_data.get('latest_updates', 'Not available')}
- Challenges: {company_data.get('challenges', 'Not available')}
- Decision Makers: {company_data.get('decision_makers', 'Not available')}
- Market Position: {company_data.get('market_position', 'Not available')}
- Future Plans: {company_data.get('future_plans', 'Not available')}

YOUR SME Profile ({sme_industry.upper()} provider):
{sme_objective}

INDUSTRY SYNERGY AREAS:
Focus on: {context['synergy']}
Value drivers: {context['value_prop']}
Engagement approach: {context['engagement']}

TASK: Create an ACTION PLAN with 3 specific, industry-aware steps for YOUR {sme_industry} SME to engage {company_name} ({target_industry}).

For each step:
- Use {target_industry}-specific terminology and context
- Show how YOUR {sme_industry} capabilities match THEIR {target_industry} needs
- Reference THEIR actual challenges, decision makers, and initiatives
- Propose concrete, measurable value YOUR SME delivers
- Be realistic about integration and implementation in {target_industry} context

Format as:
1. [Specific Action Title]: Detailed explanation referencing their actual situation and your specific solution...
2. [Specific Action Title]: Detailed explanation showing industry-specific fit and value...
3. [Specific Action Title]: Concrete next steps with realistic timeline and expected outcomes...

Be highly specific to BOTH industries. Avoid generic advice. Use actual data from their updates."""

    def _create_solutions_prompt(self, company_data: Dict[str, Any], company_name: str, sme_objective: str) -> str:
        sme_text = sme_objective
        target_text = f"{company_data.get('latest_updates', '')} {company_data.get('challenges', '')} {company_data.get('future_plans', '')}"

        sme_industry = self._detect_industry(sme_text)
        target_industry = self._detect_industry(target_text)

        context = self._get_industry_context(sme_industry, target_industry)

        return f"""You are a business solutions consultant specializing in matching {sme_industry} solutions to {target_industry} company needs in African markets.

TARGET COMPANY: {company_name} ({target_industry.upper()} industry)

Target Company Intelligence:
- Latest Updates: {company_data.get('latest_updates', 'Not available')}
- Challenges: {company_data.get('challenges', 'Not available')}
- Future Plans: {company_data.get('future_plans', 'Not available')}
- Market Position: {company_data.get('market_position', 'Not available')}

YOUR SME Profile ({sme_industry.upper()} provider):
{sme_objective}

INDUSTRY FIT CONTEXT:
Typical synergies: {context['synergy']}
Value drivers: {context['value_prop']}
Integration areas: {context['engagement']}

TASK: Identify 3 SPECIFIC solutions from YOUR {sme_industry} SME that address {company_name}'s {target_industry} needs.

For each solution:
- Name a SPECIFIC product/service YOUR SME offers (not generic categories)
- Explain HOW it solves THEIR specific challenge or supports THEIR specific plan
- Show MEASURABLE value it creates for a {target_industry} company like them
- Consider {target_industry}-specific implementation requirements
- Reference their actual data (numbers, initiatives, decision makers)

Format as:
1. [YOUR Specific Solution Name]: In the context of their [specific challenge from data], YOUR solution provides [specific capability] enabling them to [measurable outcome]. This directly supports their [specific initiative] by [concrete benefit].

2. [YOUR Specific Solution Name]: Given their [specific situation], YOUR solution addresses [specific pain point] through [specific feature/capability], creating value via [measurable result].

3. [YOUR Specific Solution Name]: For their [specific goal/plan], YOUR solution offers [specific functionality] that [concrete action/benefit], aligning with their {target_industry} operations.

Be HIGHLY specific:
- Use THEIR actual challenges, plans, and data points
- Name YOUR actual products/services (not "our platform" - say "PaymentHub API" etc.)
- Reference {target_industry}-specific metrics and KPIs
- Show concrete ROI or value creation

Avoid generic statements. Every recommendation must tie YOUR specific capability to THEIR specific need."""

    async def _call_llm(self, prompt: str) -> str:
        if self.llm_provider in ['ollama', 'auto']:
            result = await self._call_ollama(prompt)
            if result:
                return result

        if self.llm_provider in ['openai', 'auto']:
            if self.openai_api_key:
                result = await self._call_openai(prompt)
                if result:
                    return result

        return ""

    async def _call_ollama(self, prompt: str) -> str:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": "llama3.1",
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data.get('response', '').strip()
                        logger.info("✅ Generated using Ollama (llama3.1)")
                        return result
        except Exception as e:
            logger.debug(f"Ollama not available: {e}")

        return ""

    async def _call_openai(self, prompt: str) -> str:
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
                        "max_tokens": 500
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data['choices'][0]['message']['content'].strip()
                        logger.info("✅ Generated using OpenAI (gpt-3.5-turbo)")
                        return result
        except Exception as e:
            logger.debug(f"OpenAI not available: {e}")

        return ""

    def _template_action_plan(self, company_data: Dict[str, Any], company_name: str, sme_objective: str) -> str:
        sme_text = sme_objective
        target_text = f"{company_data.get('latest_updates', '')} {company_data.get('market_position', '')}"

        sme_industry = self._detect_industry(sme_text)
        target_industry = self._detect_industry(target_text)
        context = self._get_industry_context(sme_industry, target_industry)

        challenges = company_data.get('challenges', 'operational challenges')
        future_plans = company_data.get('future_plans', 'growth initiatives')
        decision_makers = company_data.get('decision_makers', 'leadership team')
        latest_updates = company_data.get('latest_updates', 'recent developments')

        return f"""1. Industry-Specific Executive Engagement ({sme_industry} → {target_industry}): Contact {company_name}'s {decision_makers} with a personalized proposal showing how your {sme_industry} capabilities in {context['synergy']} directly address their {challenges}. Reference their {latest_updates} to demonstrate industry knowledge and timely outreach.

2. Value Proposition Based on {context['value_prop']}: Develop a detailed proposal showing how your SME's {sme_objective[:120]}... can help {company_name} overcome their {challenges} while accelerating their {future_plans}. Focus on {target_industry}-specific metrics and outcomes relevant to their business model.

3. Pilot Partnership for {context['engagement']}: Propose a focused pilot project that demonstrates measurable value in 30-60 days. Based on their current priorities and your {sme_industry} capabilities, identify one high-impact area where your solutions can deliver quick wins and build foundation for broader {target_industry} partnership."""

    def _template_solutions(self, company_data: Dict[str, Any], company_name: str, sme_objective: str) -> str:
        sme_text = sme_objective
        target_text = f"{company_data.get('challenges', '')} {company_data.get('future_plans', '')}"

        sme_industry = self._detect_industry(sme_text)
        target_industry = self._detect_industry(target_text)
        context = self._get_industry_context(sme_industry, target_industry)

        challenges = company_data.get('challenges', 'operational challenges')
        future_plans = company_data.get('future_plans', 'growth initiatives')
        latest_updates = company_data.get('latest_updates', 'recent developments')

        if sme_industry == 'fintech' and target_industry == 'telecommunications':
            solution_examples = [
                f"YOUR Payment Integration API for {target_industry}",
                f"YOUR Mobile Wallet SDK for Telco Ecosystem",
                f"YOUR Transaction Analytics Platform"
            ]
        elif sme_industry == 'technology':
            solution_examples = [
                f"YOUR {target_industry.capitalize()} Platform Solution",
                f"YOUR Cloud Infrastructure Service",
                f"YOUR Digital Transformation Suite"
            ]
        else:
            solution_examples = [
                f"YOUR Core {sme_industry.capitalize()} Solution",
                f"YOUR Industry-Specific Platform",
                f"YOUR Integration Services"
            ]

        return f"""1. {solution_examples[0]}: Addressing {company_name}'s {challenges}, this solution leverages your SME's expertise in {context['synergy']} to deliver {context['value_prop']}. Specifically designed for {target_industry} companies, it helps them {future_plans} while resolving current pain points through proven {sme_industry} capabilities.

2. {solution_examples[1]}: In response to their {latest_updates}, your SME's platform provides {context['engagement']} capabilities tailored for {target_industry} operations. This solution directly supports {company_name}'s strategic objectives while offering measurable improvements in efficiency and performance.

3. {solution_examples[2]}: Building on the synergy between {sme_industry} and {target_industry} sectors, this offering combines your SME's {sme_objective[:100]}... with {company_name}'s need for {future_plans}. The solution addresses {target_industry}-specific requirements while creating sustainable partnership value through {context['value_prop']}."""

