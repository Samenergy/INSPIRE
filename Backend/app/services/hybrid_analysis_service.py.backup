
from typing import List, Dict, Any
from loguru import logger

from app.services.ner_service import NERService
from app.services.qa_service import QAService
from app.services.company_intelligence_service import CompanyIntelligenceService
from app.services.llm_analysis_service import LLMAnalysisService

class HybridAnalysisService:

    def __init__(self, use_qa_models: bool = True, use_llm: bool = True):
        self.use_qa_models = use_qa_models
        self.use_llm = use_llm

        logger.info("🔧 Initializing Hybrid Analysis System...")

        self.ner_service = NERService()

        self.qa_service = QAService(use_transformers=use_qa_models)

        self.intelligence_service = CompanyIntelligenceService()

        if use_llm:
            self.llm_service = LLMAnalysisService(llm_provider="auto")
        else:
            self.llm_service = None

        logger.info("✅ Hybrid Analysis System ready")
        logger.info(f"   - NER: ✅")
        logger.info(f"   - QA Models: {'✅' if use_qa_models else '⚠️ Fallback'}")
        logger.info(f"   - Weak Supervision: ✅")
        logger.info(f"   - LLM: {'✅' if use_llm else '⚠️ Template fallback'}")

    async def analyze_comprehensive(self, articles: List[Dict[str, str]],
                                   company_name: str,
                                   sme_objective: str) -> Dict[str, Any]:
        logger.info(f"🚀 Starting hybrid analysis for {company_name}")
        logger.info(f"📄 Articles: {len(articles)}")

        results = {}
        metadata = {
            'techniques_used': {},
            'components': {}
        }

        logger.info("Q1: Latest Updates (using QA Model + NER)...")
        q1_result = await self._extract_latest_updates(articles, company_name)
        results['1_latest_updates'] = q1_result['answer']
        metadata['techniques_used']['Q1'] = q1_result['techniques']
        metadata['components']['Q1'] = q1_result['components']

        logger.info("Q2: Challenges (using YOUR Weak Supervision)...")
        q2_result = self._extract_challenges(articles, company_name)
        results['2_challenges'] = q2_result['answer']
        metadata['techniques_used']['Q2'] = q2_result['techniques']
        metadata['components']['Q2'] = q2_result['components']

        logger.info("Q3: Decision Makers (using NER)...")
        q3_result = self._extract_decision_makers(articles, company_name)
        results['3_decision_makers'] = q3_result['answer']
        metadata['techniques_used']['Q3'] = q3_result['techniques']
        metadata['components']['Q3'] = q3_result['components']

        logger.info("Q4: Market Position (using QA Model + NER)...")
        q4_result = await self._extract_market_position(articles, company_name)
        results['4_market_position'] = q4_result['answer']
        metadata['techniques_used']['Q4'] = q4_result['techniques']
        metadata['components']['Q4'] = q4_result['components']

        logger.info("Q5: Future Plans (using QA Model)...")
        q5_result = await self._extract_future_plans(articles, company_name)
        results['5_future_plans'] = q5_result['answer']
        metadata['techniques_used']['Q5'] = q5_result['techniques']
        metadata['components']['Q5'] = q5_result['components']

        low_quality_input = (
            metadata['components']['Q1'].get('high_quality_updates', 0) == 0 or
            metadata['components']['Q2'].get('challenges_found', 0) == 0 or
            metadata['components']['Q5'].get('plans_found', 0) <= 1
        )

        if low_quality_input:
            logger.warning("⚠️ Low quality input detected - enhancing with LLM")
            logger.info(f"   Q1 high quality: {metadata['components']['Q1'].get('high_quality_updates', 0)}")
            logger.info(f"   Q2 challenges: {metadata['components']['Q2'].get('challenges_found', 0)}")
            logger.info(f"   Q5 plans: {metadata['components']['Q5'].get('plans_found', 0)}")

            if self.use_llm and self.llm_service:
                logger.info("🤖 Calling LLM to enhance low-quality results...")
                llm_results = await self.llm_service.analyze_comprehensive(
                    articles, company_name, sme_objective
                )

                if metadata['components']['Q1'].get('high_quality_updates', 0) == 0:
                    logger.info("   ✅ Using LLM for Q1 (QA had no high-quality updates)")
                    results['1_latest_updates'] = llm_results.get('1_latest_updates', results['1_latest_updates'])
                    metadata['techniques_used']['Q1'] = 'QA+NER → LLM (low quality fallback)'

                if metadata['components']['Q2'].get('challenges_found', 0) == 0:
                    logger.info("   ✅ Using LLM for Q2 (Weak Supervision found no challenges)")
                    results['2_challenges'] = llm_results.get('2_challenges', results['2_challenges'])
                    metadata['techniques_used']['Q2'] = 'Weak Supervision → LLM (low quality fallback)'

                if metadata['components']['Q5'].get('plans_found', 0) <= 1:
                    logger.info("   ✅ Using LLM for Q5 (QA found insufficient plans)")
                    results['5_future_plans'] = llm_results.get('5_future_plans', results['5_future_plans'])
                    metadata['techniques_used']['Q5'] = 'QA → LLM (low quality fallback)'
            else:
                logger.warning("   ⚠️ LLM not available, keeping original results")

        if self.use_llm and self.llm_service:
            logger.info("Q6-7: Action Plan & Solutions (using LLM)...")
            if not low_quality_input:
                llm_results = await self.llm_service.analyze_comprehensive(
                    articles, company_name, sme_objective
                )
            results['6_action_plan'] = llm_results.get('6_action_plan', '')
            results['7_solutions'] = llm_results.get('7_solutions', '')
            metadata['techniques_used']['Q6'] = 'LLM (Synthesis)'
            metadata['techniques_used']['Q7'] = 'LLM (Synthesis)'
        else:
            logger.info("Q6-7: Action Plan & Solutions (using Templates)...")
            q6_q7_result = self._template_synthesis(articles, company_name, sme_objective)
            results['6_action_plan'] = q6_q7_result['action_plan']
            results['7_solutions'] = q6_q7_result['solutions']
            metadata['techniques_used']['Q6'] = 'Template-based'
            metadata['techniques_used']['Q7'] = 'Template-based'

        metadata['fallbacks_triggered'] = low_quality_input
        if low_quality_input:
            metadata['fallback_reasons'] = []
            if metadata['components']['Q1'].get('high_quality_updates', 0) == 0:
                metadata['fallback_reasons'].append('Q1: No high-quality QA updates')
            if metadata['components']['Q2'].get('challenges_found', 0) == 0:
                metadata['fallback_reasons'].append('Q2: No challenges found by weak supervision')
            if metadata['components']['Q5'].get('plans_found', 0) <= 1:
                metadata['fallback_reasons'].append('Q5: Insufficient future plans from QA')

        logger.info("✅ Hybrid analysis complete!")

        return {
            'analysis': results,
            'metadata': metadata
        }

    async def _extract_latest_updates(self, articles: List[Dict[str, str]],
                                      company_name: str) -> Dict[str, Any]:
        updates = []

        qa_updates = await self.qa_service.extract_latest_updates(articles, company_name)

        high_quality_updates = [u for u in qa_updates if u['confidence'] > 0.4 and len(u['answer']) > 20]

        for update in high_quality_updates[:5]:
            updates.append(f"• {update['answer']} (confidence: {update['confidence']:.0%})")

        financial_metrics = self.ner_service.extract_financial_metrics(articles)
        dates = self.ner_service.extract_dates(articles)

        real_metrics = []
        for m in financial_metrics:
            metric_value = m['value']
            if not metric_value.startswith('#') and 'TungaTaci' not in metric_value:
                context = m.get('context', '').lower()
                financial_words = ['revenue', 'profit', 'investment', 'billion', 'million', 'growth', 'increase', 'decrease', 'sales', 'earnings']
                if any(word in context for word in financial_words):
                    real_metrics.append(metric_value)

        if real_metrics:
            metrics_text = ", ".join(real_metrics[:3])
            updates.append(f"• Financial metrics: {metrics_text}")

        if updates:
            answer = f"{company_name}'s latest updates:\n" + "\n".join(updates)
        else:
            answer = f"Based on {len(articles)} articles, {company_name} has recent updates. Review articles for detailed information."

        return {
            'answer': answer,
            'techniques': 'QA Model (RoBERTa-SQuAD2) + NER (SpaCy) with validation',
            'components': {
                'qa_updates': len(qa_updates),
                'high_quality_updates': len(high_quality_updates),
                'financial_metrics': len(real_metrics),
                'dates': len(dates)
            }
        }

    def _extract_challenges(self, articles: List[Dict[str, str]],
                           company_name: str) -> Dict[str, Any]:
        challenges = []

        for article in articles[:15]:
            if isinstance(article, dict):
                content = article.get('content', '')
            elif isinstance(article, str):
                content = article
            else:
                content = str(article)

            if len(content) < 100:
                continue

            intelligence = self.intelligence_service.extract_intelligence(content, company_name)

            if intelligence.get('weaknesses'):
                for weakness in intelligence['weaknesses'][:2]:
                    challenges.append(f"• {weakness['text']} (confidence: {weakness['confidence']:.0%})")

        challenges = list(dict.fromkeys(challenges))[:8]

        if challenges:
            answer = f"{company_name}'s key challenges:\n" + "\n".join(challenges[:5])
        else:
            answer = f"Based on analysis of articles, {company_name} faces various operational and competitive challenges. Review article content for specifics."

        return {
            'answer': answer,
            'techniques': 'Weak Supervision (Semantic Similarity + Pattern Matching + Keyword Scoring)',
            'components': {
                'service': 'CompanyIntelligenceService (YOUR CODE!)',
                'challenges_found': len(challenges)
            }
        }

    def _extract_decision_makers(self, articles: List[Dict[str, str]],
                                company_name: str) -> Dict[str, Any]:
        decision_makers = self.ner_service.extract_decision_makers(articles, company_name)

        if decision_makers:
            dm_list = []
            for dm in decision_makers[:8]:
                dm_list.append(f"• {dm['name']} - {dm['role']} (confidence: {dm['confidence']:.0%})")

            answer = f"Key decision-makers at {company_name}:\n" + "\n".join(dm_list)
        else:
            answer = f"Decision makers are mentioned in the articles. Review content for executive names and roles."

        return {
            'answer': answer,
            'techniques': 'NER (SpaCy) + Role Extraction (Pattern Matching)',
            'components': {
                'decision_makers_found': len(decision_makers),
                'high_confidence': len([dm for dm in decision_makers if dm['confidence'] > 0.7])
            }
        }

    async def _extract_market_position(self, articles: List[Dict[str, str]],
                                       company_name: str) -> Dict[str, Any]:
        market_data = await self.qa_service.extract_market_position(articles, company_name)

        orgs = self.ner_service.extract_organizations(articles)

        company_keywords = set(company_name.lower().split())
        competitors = []
        for org in orgs:
            org_name = org['name']
            org_lower = org_name.lower()

            if any(keyword in org_lower for keyword in company_keywords):
                continue

            if 'bank' in org_lower:
                continue

            competitors.append(org_name)
            if len(competitors) >= 5:
                break

        answer_parts = []

        for key, value in market_data.items():
            answer_parts.append(f"• {key.replace('_', ' ').title()}: {value['answer']}")

        if competitors:
            answer_parts.append(f"• Competitors mentioned: {', '.join(competitors)}")

        if answer_parts:
            answer = f"{company_name}'s market position:\n" + "\n".join(answer_parts)
        else:
            answer = f"{company_name} operates in its industry with various competitive dynamics. Review articles for market share, competitors, and trends."

        return {
            'answer': answer,
            'techniques': 'QA Model (factual extraction) + NER (competitor identification)',
            'components': {
                'market_aspects': len(market_data),
                'competitors_found': len(competitors)
            }
        }

    async def _extract_future_plans(self, articles: List[Dict[str, str]],
                                    company_name: str) -> Dict[str, Any]:
        plans = await self.qa_service.extract_future_plans(articles, company_name)

        if plans:
            plan_list = []
            for plan in plans[:6]:
                plan_list.append(f"• {plan['answer']}")

            answer = f"{company_name}'s future plans and initiatives:\n" + "\n".join(plan_list)
        else:
            answer = f"Articles mention various initiatives and plans for {company_name}. Review content for announcements about expansions, partnerships, and investments."

        return {
            'answer': answer,
            'techniques': 'QA Model (future-focused questions)',
            'components': {
                'plans_found': len(plans),
                'high_confidence': len([p for p in plans if p['confidence'] > 0.5])
            }
        }

    def _template_synthesis(self, articles: List[Dict[str, str]],
                           company_name: str, sme_objective: str) -> Dict[str, str]:
        sme_text = sme_objective.lower()

        article_contents = []
        for a in articles[:5]:
            if isinstance(a, dict):
                content = a.get('content', '')
            elif isinstance(a, str):
                content = a
            else:
                content = str(a)
            article_contents.append(content[:500])

        articles_text = " ".join(article_contents).lower()

        sme_industry = self._simple_industry_detection(sme_text)
        target_industry = self._simple_industry_detection(articles_text)

        action_plan = f"""Based on your {sme_industry} SME's capabilities and {company_name}'s {target_industry} operations:

1. RESEARCH: Analyze {company_name}'s current initiatives from the articles and identify how your SME's offerings ({sme_objective[:100]}...) align with their needs.

2. DEVELOP: Create a value proposition showing how your solutions address their industry-specific challenges, focusing on operational efficiency and strategic value.

3. ENGAGE: Contact decision makers identified in the articles with a targeted proposal for partnership or solution integration opportunities.
"""

        solutions = f"""Recommended solutions from your {sme_industry} SME for {company_name}:

1. YOUR Primary Solution: Leverage your core capabilities to support {company_name}'s {target_industry} operations, delivering operational efficiency and strategic value.

2. YOUR Industry-Specific Platform: Tailored for {target_industry} companies, addresses their unique challenges while integrating with their existing systems.

3. YOUR Partnership Service: Enables strategic collaboration between your {sme_industry} solutions and their {target_industry} ecosystem, creating mutual value.
"""

        return {
            'action_plan': action_plan,
            'solutions': solutions
        }

    def _simple_industry_detection(self, text: str) -> str:
        industries = {
            'fintech': ['payment', 'fintech', 'financial', 'mobile money', 'wallet'],
            'telecom': ['telecom', 'mobile', 'network', 'subscriber'],
            'retail': ['retail', 'store', 'shopping', 'e-commerce'],
            'technology': ['software', 'platform', 'saas', 'tech'],
        }

        for industry, keywords in industries.items():
            if any(kw in text for kw in keywords):
                return industry

        return 'business'

