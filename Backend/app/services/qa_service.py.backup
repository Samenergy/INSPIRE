
from typing import List, Dict, Any, Optional
from loguru import logger
import asyncio

class QAService:

    def __init__(self, use_transformers: bool = True):
        self.use_transformers = use_transformers
        self.pipeline = None

        if use_transformers:
            try:
                from transformers import pipeline
                logger.info("Loading QA model (RoBERTa-SQuAD2)...")
                self.pipeline = pipeline(
                    "question-answering",
                    model="deepset/roberta-base-squad2",
                    tokenizer="deepset/roberta-base-squad2"
                )
                logger.info("✅ QA Service initialized (RoBERTa-SQuAD2)")
            except ImportError:
                logger.warning("⚠️ transformers not installed, using fallback extraction")
                self.use_transformers = False
            except Exception as e:
                logger.warning(f"⚠️ QA model loading failed: {e}, using fallback")
                self.use_transformers = False
        else:
            logger.info("QA Service initialized (fallback mode)")

    async def extract_latest_updates(self, articles: List[Dict[str, str]],
                                     company_name: str) -> List[Dict[str, Any]]:
        questions = [
            f"Who was appointed as CEO of {company_name}?",
            f"Who is the new CEO of {company_name}?",
            f"What was {company_name}'s profit or revenue?",
            f"How much did {company_name} invest?",
            f"What percentage did {company_name}'s profit increase?",
            f"What new service did {company_name} launch?",
            f"What partnership did {company_name} announce?",
            f"What expansion is {company_name} planning?",
        ]

        updates = []

        for article in articles[:10]:
            content = article.get('content', '')
            if len(content) < 100:
                continue

            for question in questions:
                answer_data = await self._ask_question(question, content)

                if answer_data and answer_data['confidence'] > 0.3:
                    answer_text = answer_data['answer']

                    if self._is_valid_answer(answer_text, question):
                        updates.append({
                            'question': question,
                            'answer': answer_text,
                            'confidence': answer_data['confidence'],
                            'source': article.get('title', '')[:100]
                        })

        updates.sort(key=lambda x: x['confidence'], reverse=True)

        updates = self._deduplicate_answers(updates)

        logger.info(f"📊 Extracted {len(updates)} updates via QA")
        return updates[:10]

    async def extract_market_position(self, articles: List[Dict[str, str]],
                                      company_name: str) -> Dict[str, Any]:
        questions = {
            'market_share': f"What is {company_name}'s market share?",
            'competitors': f"Who are {company_name}'s main competitors?",
            'industry_trends': f"What industry trends affect {company_name}?",
            'regulatory': f"What regulatory issues does {company_name} face?",
            'market_leader': f"Is {company_name} a market leader?",
        }

        results = {}

        combined_context = self._prepare_context(articles)

        for key, question in questions.items():
            answer_data = await self._ask_question(question, combined_context)

            if answer_data and answer_data['confidence'] > 0.2:
                results[key] = {
                    'answer': answer_data['answer'],
                    'confidence': answer_data['confidence']
                }

        logger.info(f"📊 Extracted market position (QA): {len(results)} aspects")
        return results

    async def extract_future_plans(self, articles: List[Dict[str, str]],
                                   company_name: str) -> List[Dict[str, Any]]:
        questions = [
            f"What are {company_name}'s expansion plans?",
            f"What investments is {company_name} planning?",
            f"What new partnerships is {company_name} pursuing?",
            f"What products will {company_name} launch?",
            f"What is {company_name}'s growth strategy?",
        ]

        plans = []

        for article in articles[:10]:
            content = article.get('content', '')
            if len(content) < 100:
                continue

            for question in questions:
                answer_data = await self._ask_question(question, content)

                if answer_data and answer_data['confidence'] > 0.3:
                    plans.append({
                        'question': question,
                        'answer': answer_data['answer'],
                        'confidence': answer_data['confidence'],
                        'source': article.get('title', '')[:100]
                    })

        plans.sort(key=lambda x: x['confidence'], reverse=True)
        plans = self._deduplicate_answers(plans)

        logger.info(f"📊 Extracted {len(plans)} future plans via QA")
        return plans[:8]

    async def _ask_question(self, question: str, context: str) -> Optional[Dict[str, Any]]:
        if not context or len(context.strip()) < 50:
            return None

        if len(context) > 2000:
            context = context[:2000]

        if self.use_transformers and self.pipeline:
            try:
                result = self.pipeline(question=question, context=context)

                if result['score'] < 0.1:
                    return None

                return {
                    'answer': result['answer'].strip(),
                    'confidence': result['score']
                }
            except Exception as e:
                logger.warning(f"QA error: {e}")
                return None
        else:
            return self._fallback_extraction(question, context)

    def _fallback_extraction(self, question: str, context: str) -> Optional[Dict[str, Any]]:
        question_lower = question.lower()

        sentences = context.split('.')

        best_sentence = None
        best_score = 0.0

        for sentence in sentences:
            sentence_lower = sentence.lower()
            score = 0.0

            if 'what' in question_lower:
                if any(word in sentence_lower for word in ['is', 'are', 'was', 'were']):
                    score += 0.3

            if 'who' in question_lower:
                if any(word in sentence_lower for word in ['ceo', 'president', 'director', 'executive']):
                    score += 0.4

            question_words = set(question_lower.split()) - {'what', 'who', 'is', 'are', 'the', 'a', 'an'}
            sentence_words = set(sentence_lower.split())
            matches = len(question_words & sentence_words)
            score += matches * 0.1

            if score > best_score:
                best_score = score
                best_sentence = sentence.strip()

        if best_score > 0.2 and best_sentence:
            return {
                'answer': best_sentence,
                'confidence': min(0.6, best_score)
            }

        return None

    def _prepare_context(self, articles: List[Dict[str, str]], max_length: int = 3000) -> str:
        contexts = []
        total_length = 0

        for article in articles[:8]:
            content = article.get('content', '')
            if len(content) > 100:
                if total_length + len(content) > max_length:
                    remaining = max_length - total_length
                    if remaining > 200:
                        contexts.append(content[:remaining])
                    break
                else:
                    contexts.append(content)
                    total_length += len(content)

        return "\n\n".join(contexts)

    def _is_valid_answer(self, answer: str, question: str) -> bool:
        answer_lower = answer.lower().strip()

        if len(answer) < 5:
            return False

        generic_words = ['technology', 'innovation', 'business', 'service', 'company', 'network']
        if answer_lower in generic_words:
            return False

        stop_words = ['and', 'the', 'a', 'an', 'of', 'in', 'to', 'for']
        if answer_lower in stop_words:
            return False

        title_fragments = ['takes helm', 'driving', 'inclusive', 'growth', 'launches', 'announces']
        if any(fragment in answer_lower for fragment in title_fragments) and len(answer_lower) < 30:
            return False

        return True

    def _deduplicate_answers(self, answers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if len(answers) <= 1:
            return answers

        unique = []
        seen_answers = set()

        for answer_data in answers:
            answer_text = answer_data['answer'].lower().strip()

            if len(answer_text) < 10:
                continue

            is_duplicate = False
            for seen in seen_answers:
                answer_words = set(answer_text.split())
                seen_words = set(seen.split())

                if len(answer_words & seen_words) / max(len(answer_words), 1) > 0.7:
                    is_duplicate = True
                    break

            if not is_duplicate:
                unique.append(answer_data)
                seen_answers.add(answer_text)

        return unique

