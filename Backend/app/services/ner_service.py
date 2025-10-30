
from typing import List, Dict, Any
from collections import defaultdict
from loguru import logger

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logger.warning("⚠️ SpaCy not available. NER service will use fallback mode.")

class NERService:

    def __init__(self):
        self.nlp = None

        if not SPACY_AVAILABLE:
            logger.warning("⚠️ NER Service in fallback mode (SpaCy not available)")
            return

        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("✅ NER Service initialized (SpaCy en_core_web_sm)")
        except OSError:
            logger.warning("⚠️ SpaCy model not found. NER will use fallback mode.")
            self.nlp = None
        except Exception as e:
            logger.warning(f"⚠️ NER Service initialization failed: {e}. Using fallback mode.")
            self.nlp = None

        self.decision_maker_roles = {
            'ceo', 'chief executive', 'president', 'founder', 'co-founder',
            'cfo', 'chief financial', 'finance director',
            'cto', 'chief technology', 'chief technical',
            'coo', 'chief operating',
            'cmo', 'chief marketing',
            'chairman', 'chairwoman', 'chair',
            'director', 'managing director', 'executive director',
            'board member', 'board director',
            'head of', 'vice president', 'vp',
            'general manager', 'country manager',
            'chief', 'executive'
        }

    def extract_entities(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        if not text:
            return {}

        doc = self.nlp(text)

        entities = defaultdict(list)

        for ent in doc.ents:
            entity_info = {
                'text': ent.text,
                'label': ent.label_,
                'start': ent.start_char,
                'end': ent.end_char,
                'context': self._get_context(text, ent.start_char, ent.end_char)
            }
            entities[ent.label_].append(entity_info)

        return dict(entities)

    def extract_decision_makers(self, articles: List[Dict[str, str]],
                               company_name: str = None) -> List[Dict[str, Any]]:
        decision_makers = []
        seen = set()

        for article in articles:
            text = article.get('content', '') + ' ' + article.get('title', '')

            if not text.strip():
                continue

            doc = self.nlp(text)

            for ent in doc.ents:
                if ent.label_ == 'PERSON':
                    name = ent.text.strip()

                    name_words = set(name.lower().split())
                    is_duplicate = False
                    for seen_name in seen:
                        seen_words = set(seen_name.split())
                        if len(name_words & seen_words) >= 2:
                            is_duplicate = True
                            break

                    if is_duplicate or name.lower() in seen:
                        continue

                    context = self._get_context(text, ent.start_char, ent.end_char, window=200)

                    if not self._is_related_to_company(name, context, company_name):
                        continue

                    role = self._extract_role(context, name)

                    if role or self._is_likely_decision_maker(context):
                        decision_makers.append({
                            'name': name,
                            'role': role or 'Executive',
                            'context': context,
                            'confidence': self._calculate_confidence(context, role)
                        })
                        seen.add(name.lower())

        decision_makers.sort(key=lambda x: x['confidence'], reverse=True)

        logger.info(f"📊 Extracted {len(decision_makers)} decision makers")
        return decision_makers

    def _is_related_to_company(self, name: str, context: str, company_name: str) -> bool:
        if not company_name:
            return True

        context_lower = context.lower()
        name_lower = name.lower()
        company_lower = company_name.lower()

        org_indicators = ['bank', 'ltd', 'limited', 'inc', 'corporation', 'company', 'group', 'plc', 'llc', 'gmbh']
        if any(indicator in name_lower for indicator in org_indicators):
            return False

        social_media_indicators = ['#', 'nicyogihe', 'tungataci', '@', 'tunga taci']
        if any(indicator in name_lower for indicator in social_media_indicators):
            return False

        if len(name.strip()) < 4:
            return False

        title_fragments = ['takes helm', 'driving', 'inclusive', 'growth', 'ushered', 'pivotal', 'moment', 'journey']
        if any(fragment in name_lower for fragment in title_fragments):
            return False

        vendor_names = ['ericsson', 'huawei', 'nokia', 'samsung', 'cisco']
        if any(vendor in name_lower for vendor in vendor_names):
            return False

        company_parts = [part for part in company_lower.split() if len(part) > 2]
        if any(part in name_lower for part in company_parts):
            return False

        company_keywords = company_lower.split()

        has_company_mention = any(keyword in context_lower for keyword in company_keywords if len(keyword) > 2)

        if not has_company_mention:
            return False

        exclude_patterns = ['championship', 'week', 'centre', 'center', 'unicef', 'sponsor']
        if any(pattern in name_lower for pattern in exclude_patterns):
            return False

        return True

    def extract_financial_metrics(self, articles: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        metrics = []

        for article in articles:
            text = article.get('content', '') + ' ' + article.get('title', '')

            if not text.strip():
                continue

            doc = self.nlp(text)

            for ent in doc.ents:
                if ent.label_ in ['MONEY', 'PERCENT']:
                    metrics.append({
                        'value': ent.text,
                        'type': ent.label_,
                        'context': self._get_context(text, ent.start_char, ent.end_char),
                        'source': article.get('title', '')[:100]
                    })

        logger.info(f"📊 Extracted {len(metrics)} financial metrics")
        return metrics

    def extract_dates(self, articles: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        dates = []

        for article in articles:
            text = article.get('content', '') + ' ' + article.get('title', '')

            if not text.strip():
                continue

            doc = self.nlp(text)

            for ent in doc.ents:
                if ent.label_ == 'DATE':
                    dates.append({
                        'date': ent.text,
                        'context': self._get_context(text, ent.start_char, ent.end_char),
                        'source': article.get('title', '')[:100]
                    })

        logger.info(f"📊 Extracted {len(dates)} dates")
        return dates

    def extract_organizations(self, articles: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        orgs = []
        seen = set()

        for article in articles:
            text = article.get('content', '') + ' ' + article.get('title', '')

            if not text.strip():
                continue

            doc = self.nlp(text)

            for ent in doc.ents:
                if ent.label_ == 'ORG':
                    org_name = ent.text.strip()

                    if org_name.lower() not in seen:
                        context = self._get_context(text, ent.start_char, ent.end_char)

                        if self._is_likely_competitor(org_name, context):
                            orgs.append({
                                'name': org_name,
                                'context': context,
                                'source': article.get('title', '')[:100]
                            })
                            seen.add(org_name.lower())

        logger.info(f"📊 Extracted {len(orgs)} organizations")
        return orgs

    def _is_likely_competitor(self, org_name: str, context: str) -> bool:
        org_lower = org_name.lower()
        context_lower = context.lower()

        event_keywords = ['championship', 'conference', 'summit', 'week', 'day', 'concert', 'festival']
        if any(keyword in org_lower for keyword in event_keywords):
            return False

        charity_keywords = ['unicef', 'unesco', 'who', 'red cross', 'charity', 'foundation']
        if any(keyword in org_lower for keyword in charity_keywords):
            return False

        internal_keywords = ['service centre', 'service center', 'hub', 'office']
        if any(keyword in org_lower for keyword in internal_keywords):
            return False

        technical_terms = [
            'wireless networks', 'networks', 'data centres', 'data centers',
            'biodegradable', 'mobile 5', 'g data', 'gdc', 'kepios',
            'technology', 'infrastructure', 'platform', 'service'
        ]
        if any(term in org_lower for term in technical_terms):
            return False

        if len(org_name.strip()) < 4:
            return False

        company_indicators = [
            'telecom', 'mobile', 'operator', 'wireless', 'carrier',
            'airtel', 'vodafone', 'orange', 'starlink', 'safaricom',
            'bank', 'financial', 'payment', 'fintech',
            'ltd', 'inc', 'corp', 'limited', 'group', 'plc'
        ]
        has_company_indicator = any(indicator in org_lower for indicator in company_indicators)

        competitor_indicators = ['competitor', 'rival', 'competing', 'versus', 'vs', 'competes with']
        has_competitor_mention = any(indicator in context_lower for indicator in competitor_indicators)

        return has_company_indicator or has_competitor_mention

    def _get_context(self, text: str, start: int, end: int, window: int = 100) -> str:
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        return text[context_start:context_end].strip()

    def _extract_role(self, context: str, name: str) -> str:
        context_lower = context.lower()

        patterns = [
            (f"{name.lower()},", 50),
            (f"{name.lower()} is", 30),
            (f"{name.lower()} as", 30),
            (name.lower(), 100),
        ]

        for pattern, window in patterns:
            if pattern in context_lower:
                idx = context_lower.index(pattern)
                snippet = context_lower[max(0, idx-window):min(len(context_lower), idx+window)]

                for role in self.decision_maker_roles:
                    if role in snippet:
                        return self._clean_role(role, snippet)

        return None

    def _clean_role(self, role_keyword: str, context: str) -> str:
        role_map = {
            'ceo': 'CEO',
            'cfo': 'CFO',
            'cto': 'CTO',
            'coo': 'COO',
            'cmo': 'CMO',
            'chief executive': 'CEO',
            'chief financial': 'CFO',
            'chief technology': 'CTO',
            'chief technical': 'CTO',
            'chief operating': 'COO',
            'chief marketing': 'CMO',
        }

        return role_map.get(role_keyword, role_keyword.title())

    def _is_likely_decision_maker(self, context: str) -> bool:
        context_lower = context.lower()

        decision_indicators = [
            'announced', 'said', 'stated', 'appointed', 'named',
            'leads', 'leading', 'oversees', 'manages', 'responsible for',
            'board', 'executive', 'director', 'officer', 'president',
            'decision', 'strategy', 'initiative'
        ]

        return any(indicator in context_lower for indicator in decision_indicators)

    def _calculate_confidence(self, context: str, role: str) -> float:
        score = 0.0
        context_lower = context.lower()

        if role:
            if role in ['CEO', 'CFO', 'CTO', 'COO', 'CMO', 'Chairman']:
                score += 0.7
            elif role in ['President', 'Director', 'VP', 'Head Of', 'General Manager']:
                score += 0.4
            else:
                score += 0.3

        if self._is_likely_decision_maker(context):
            score += 0.2

        appointment_keywords = ['appointed', 'named', 'new ceo', 'takes helm', 'announced']
        if any(keyword in context_lower for keyword in appointment_keywords):
            score += 0.1

        return min(1.0, score)

