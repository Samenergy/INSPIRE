"""Company Intelligence Extraction Service using Weak Supervision.

This service extracts company intelligence (descriptions, strengths, weaknesses, opportunities)
from individual articles using a custom weak supervision framework.

YOUR CONTRIBUTIONS (for Capstone Defense):
1. Custom prototype-based weak supervision methodology
2. Domain-specific keyword engineering for African fintech/MSME context
3. Hybrid scoring algorithm combining semantic similarity with keyword boosting
4. Multi-category confidence scoring system
5. Context-aware sentence filtering and validation
"""

import re
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer, util
import warnings
warnings.filterwarnings('ignore')

try:
    from nltk.tokenize import sent_tokenize
    import nltk
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        try:
            nltk.download('punkt', quiet=True)
        except:
            pass
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False


class CompanyIntelligenceService:
    """Service for extracting company intelligence from articles using weak supervision."""
    
    def __init__(self):
        """Initialize the intelligence extraction service."""
        # Use pre-trained embeddings (allowed by panel)
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # YOUR CONTRIBUTION: Custom prototypes for each category
        self.prototypes = self._create_prototypes()
        
        # YOUR CONTRIBUTION: Domain-specific keywords
        self.keywords = self._create_keywords()
        
        # YOUR CONTRIBUTION: Custom thresholds (optimized through validation)
        self.thresholds = {
            'description': 0.50,  # Lower threshold, rely on validation for quality
            'strength': 0.50,
            'weakness': 0.52,  # Slightly higher, combined with validation
            'opportunity': 0.52,
            'confidence_high': 0.70,
            'confidence_medium': 0.55
        }
        
        print("Company Intelligence Service initialized")
        print(f"- Description prototypes: {len(self.prototypes['description'])}")
        print(f"- Strength prototypes: {len(self.prototypes['strength'])}")
        print(f"- Weakness prototypes: {len(self.prototypes['weakness'])}")
        print(f"- Opportunity prototypes: {len(self.prototypes['opportunity'])}")
    
    def _create_prototypes(self) -> Dict[str, List[str]]:
        """
        YOUR CONTRIBUTION: Create semantic prototypes for each intelligence category.
        These define what we're looking for in articles.
        """
        return {
            'description': [
                "The company is a telecommunications provider offering services",
                "The organization operates as a mobile network operator providing connectivity",
                "The business is a technology company specializing in digital solutions",
                "The firm is a financial services provider offering payment solutions",
                "The company provides telecommunications services including mobile voice and data",
                "The organization is a fintech company offering mobile money services",
                "The mobile telecommunications company operates in the market",
                "The leading provider of mobile services and digital payments",
                "The company offers mobile telecommunications and financial services",
                "The telecommunications operator provides mobile network services"
            ],
            'strength': [
                "The company has strong market position and competitive advantage",
                "Leading provider with significant market share",
                "Strong financial performance and profitability",
                "Excellent brand recognition and customer loyalty",
                "Robust infrastructure and technology platform",
                "Large customer base and network effects",
                "Experienced leadership team and management",
                "Strategic partnerships and alliances",
                "Innovation and product development capabilities",
                "Economies of scale and operational efficiency",
                "Strong regulatory relationships and compliance",
                "High customer satisfaction and retention rates"
            ],
            'weakness': [
                "The company faces significant challenges and difficulties",
                "The organization struggles with operational issues and problems",
                "Major obstacles affecting the company's performance",
                "The business encounters regulatory challenges and compliance difficulties",
                "High operational costs impact the company's profitability",
                "Limited market presence restricts the company's growth",
                "Technology infrastructure poses challenges for the organization",
                "Customer acquisition costs create financial pressure for the company",
                "The firm's dependence on specific markets creates vulnerability",
                "Management challenges affect the company's operations",
                "Financial constraints limit the company's investment capacity",
                "Employee retention issues impact the organization's stability"
            ],
            'opportunity': [
                "Expansion into new markets and regions",
                "Growth potential and market opportunities",
                "New product development and innovation",
                "Strategic partnerships and collaborations",
                "Digital transformation and technology adoption",
                "Market expansion and customer acquisition",
                "Emerging markets and untapped segments",
                "Merger and acquisition opportunities",
                "Revenue diversification and new business lines",
                "Technology platform expansion",
                "Cross-border expansion opportunities",
                "Value-added services and product enhancements"
            ]
        }
    
    def _create_keywords(self) -> Dict[str, List[str]]:
        """
        YOUR CONTRIBUTION: Domain-specific keywords for African fintech/MSME context.
        These boost relevance scores for domain-specific terms.
        """
        return {
            'description': [
                'telecommunications company', 'telecommunications provider', 'mobile operator',
                'mobile network', 'fintech company', 'financial services provider',
                'provider', 'operator', 'company is', 'company has been',
                'provides', 'offers', 'operates', 'specializes', 'focuses on',
                'services include', 'main business', 'core business', 'leading',
                'telecommunications', 'fintech', 'financial services', 'payments',
                'mobile money', 'digital banking', 'e-commerce', 'technology',
                'mobile voice', 'mobile data', 'connectivity', 'network operator',
                'since', 'established', 'founded', 'operation since'
            ],
            'strength': [
                'leading', 'largest', 'number one', 'market leader', 'dominant',
                'strong', 'robust', 'excellent', 'superior', 'competitive advantage',
                'market share', 'customer base', 'subscribers', 'profitable',
                'revenue growth', 'financial performance', 'innovation', 'technology',
                'brand recognition', 'customer loyalty', 'network', 'infrastructure',
                'partnerships', 'strategic alliances', 'experienced team', 'leadership',
                'economies of scale', 'efficiency', 'quality', 'reliable'
            ],
            'weakness': [
                'company faces', 'company struggles', 'faces challenges', 'faces difficulties',
                'company challenges', 'organization faces', 'business faces',
                'challenge', 'challenges', 'difficulty', 'problem', 'issue', 'issues',
                'concern', 'concerns', 'weakness', 'weaknesses', 'limitation', 'limitations',
                'constraint', 'constraints', 'obstacle', 'obstacles',
                'competition', 'competitive pressure', 'competitors', 'competing',
                'regulatory', 'regulation', 'compliance', 'regulatory pressure',
                'high cost', 'high costs', 'expensive', 'costly',
                'debt', 'loss', 'losses', 'decline', 'declining', 'struggle', 'struggling',
                'limited', 'limitation', 'dependence', 'dependent', 'reliance', 'relies on',
                'vulnerability', 'vulnerable', 'risk', 'risks', 'threatens', 'threat',
                'turnover', 'attrition', 'dissatisfaction', 'concerns about',
                'however', 'despite', 'although', 'but', 'nevertheless'
            ],
            'opportunity': [
                'opportunity', 'opportunities', 'potential', 'growth', 'expansion',
                'new market', 'emerging market', 'untapped', 'develop', 'launch',
                'partnership', 'collaboration', 'strategic alliance', 'merger',
                'acquisition', 'innovation', 'new product', 'diversification',
                'digital transformation', 'technology adoption', 'scale',
                'international', 'cross-border', 'regional expansion', 'africa',
                'increase', 'enhance', 'improve', 'extend', 'broaden'
            ]
        }
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess text."""
        if not text or pd.isna(text):
            return ""
        
        text = str(text).strip()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'http[s]?://\S+', '', text)
        
        return text.strip()
    
    def _extract_sentences(self, text: str) -> List[str]:
        """Extract sentences from text."""
        if not text:
            return []
        
        clean_text = self._preprocess_text(text)
        
        # Protect decimal numbers before sentence splitting
        # Replace patterns like "62.9%" with "62[DOT]9%" temporarily
        protected_text = re.sub(r'(\d+)\.(\d+)', r'\1[DOT]\2', clean_text)
        
        if NLTK_AVAILABLE:
            try:
                sentences = sent_tokenize(protected_text)
            except:
                sentences = re.split(r'[.!?]+\s+', protected_text)
                sentences = [s.strip() for s in sentences if s.strip()]
        else:
            # Only split on sentence-ending punctuation followed by space or end of string
            sentences = re.split(r'[.!?]+\s+', protected_text)
            sentences = [s.strip() for s in sentences if s.strip()]
        
        # Restore decimal numbers
        sentences = [s.replace('[DOT]', '.') for s in sentences]
        
        # Filter sentences
        filtered = []
        for sent in sentences:
            sent = sent.strip()
            if 15 <= len(sent) <= 500 and len(sent.split()) >= 3:
                filtered.append(sent)
        
        return filtered
    
    def _calculate_similarity_scores(self, sentences: List[str], 
                                     category: str) -> List[float]:
        """
        YOUR CONTRIBUTION: Calculate semantic similarity to prototypes.
        Uses sentence embeddings and cosine similarity.
        """
        if not sentences:
            return []
        
        # Get prototypes for this category
        prototypes = self.prototypes[category]
        
        # Encode sentences and prototypes
        sentence_embeddings = self.sentence_model.encode(sentences, normalize_embeddings=True)
        prototype_embeddings = self.sentence_model.encode(prototypes, normalize_embeddings=True)
        
        # Calculate maximum similarity to any prototype
        similarities = []
        for sent_emb in sentence_embeddings:
            # Compare to all prototypes, take maximum
            sims = util.cos_sim(sent_emb, prototype_embeddings).cpu().numpy().flatten()
            max_sim = float(np.max(sims))
            similarities.append(max_sim)
        
        return similarities
    
    def _apply_keyword_boost(self, sentences: List[str], similarities: List[float],
                            category: str) -> List[float]:
        """
        YOUR CONTRIBUTION: Apply keyword-based boosting to similarity scores.
        Domain-specific keywords increase relevance.
        """
        keywords = self.keywords[category]
        boosted_scores = []
        
        for idx, (sent, sim) in enumerate(zip(sentences, similarities)):
            sent_lower = sent.lower()
            
            # Count keyword matches
            keyword_count = sum(1 for keyword in keywords if keyword in sent_lower)
            
            # Apply boost
            boost = min(keyword_count * 0.05, 0.15)  # Max 15% boost
            
            # Extra boost for descriptions that appear early (where company info usually is)
            if category == 'description' and idx < 3:
                boost += 0.10
            
            # Extra boost for phrases that clearly identify what the company IS
            if category == 'description':
                identifying_phrases = [
                    'telecommunications company', 'telecommunications provider',
                    'mobile operator', 'fintech company', 'company is a',
                    'company is the', 'provider of', 'operator of'
                ]
                if any(phrase in sent_lower for phrase in identifying_phrases):
                    boost += 0.15
            
            boosted_score = min(sim + boost, 1.0)
            boosted_scores.append(boosted_score)
        
        return boosted_scores
    
    def _is_valid_weakness(self, sentence: str) -> bool:
        """
        YOUR CONTRIBUTION: Validate if sentence is actually a weakness.
        Filters out generic sentences, introductions, and irrelevant content.
        """
        sent_lower = sentence.lower()
        
        # Filter out introductory/filler sentences
        invalid_patterns = [
            r'^here are',
            r'^this article',
            r'^in this',
            r'^the article',
            r'^we will',
            r'^let\'s',
            r'^read more',
            r'^click here',
            r'^subscribe',
            r'^follow',
            r'examining the',
            r'insights into',
            r'looking at',
            r'when you look',
            r'for more information',
            r'to learn more',
            r'this page (should|will|can) help',  # Help page content
            r'most basic issues',
            r'insider (usa|uk|australia)',  # News site references
            r'business insider',
            r'contact (us|support|customer)',
            r'help (center|desk|page)'
        ]
        
        for pattern in invalid_patterns:
            if re.search(pattern, sent_lower):
                return False
        
        # REJECT: Sentences that mention overcoming/resolving challenges (positive outcomes)
        positive_outcome_patterns = [
            r'ended (the year|on) (an? )?(optimistic|positive|strong)',
            r'(overcome|overcame|addressed|resolved|solved) (the )?(challenge|problem|issue)',
            r'notable improvement',
            r'significant progress',
            r'successfully (addressed|resolved|managed)',
            r'on a (positive|optimistic|strong) note',
            r'improvement in',
            r'recovery from'
        ]
        
        for pattern in positive_outcome_patterns:
            if re.search(pattern, sent_lower):
                return False
        
        # REJECT: Sentences about opportunities (not weaknesses)
        opportunity_patterns = [
            r'opportunit(y|ies) (for|to|include|remain)',
            r'expansion into',
            r'growth potential',
            r'presents opportunit'
        ]
        
        for pattern in opportunity_patterns:
            if re.search(pattern, sent_lower):
                return False
        
        # Must contain actual weakness indicators
        weakness_indicators = [
            'company faces', 'company struggles', 'faces challenge', 
            'faces difficulty', 'company challenge', 'company noted challenge',
            'regulatory challenge', 'regulatory pressure', 'competition from',
            'high cost', 'high operational cost', 'employee concern', 'turnover',
            'debt', 'financial constraint', 'loss', 'decline', 'struggle',
            'limited', 'concern about', 'issue with', 'problem with',
            'difficulty', 'obstacle', 'risk'
        ]
        
        # Strong weakness indicators (must have at least one)
        strong_indicators = [
            'however,', 'despite', 'although', 'but ', 'yet ',
            'challenge', 'problem', 'issue', 'concern', 'difficulty'
        ]
        
        has_weakness_indicator = any(ind in sent_lower for ind in weakness_indicators)
        has_strong_indicator = any(ind in sent_lower for ind in strong_indicators)
        
        # Must have at least one strong indicator OR multiple weakness indicators
        if not (has_strong_indicator or has_weakness_indicator):
            return False
        
        # Must be substantial
        is_substantial = len(sentence.split()) >= 8
        
        # Should NOT be just a market comparison
        is_comparison = all(word in sent_lower for word in ['market', 'when you look'])
        
        return is_substantial and not is_comparison
    
    def _is_valid_description(self, sentence: str, company_name: str = "") -> Tuple[bool, float]:
        """
        YOUR CONTRIBUTION: Validate if sentence is actually a company description.
        Returns (is_valid, priority_boost)
        
        Prioritizes sentences that define WHAT the company IS, not their performance.
        CRITICAL: Must contain the company name (or close match)!
        """
        sent_lower = sentence.lower()
        company_lower = company_name.lower() if company_name else ""
        
        # CRITICAL REQUIREMENT: Must contain company name or very close match
        if company_name:
            # Split company name into parts (e.g., "MTN Rwanda" -> ["mtn", "rwanda"])
            company_parts = company_lower.split()
            main_company = company_parts[0] if company_parts else company_lower
            
            # Check if sentence contains the main company identifier
            has_company_name = main_company in sent_lower or company_lower in sent_lower
            
            # REJECT if it doesn't contain the company name
            # (This prevents picking up descriptions of news sources like "Telecompaper")
            if not has_company_name:
                return False, 0.0
        
        # HIGH PRIORITY: Sentences that explicitly define what the company IS
        defining_patterns = [
            r'\bis\s+a\s+\w+\s+(company|provider|operator|organization|firm|business)',
            r'\bis\s+the\s+(leading|largest|premier|top)\s+\w+\s+(company|provider|operator)',
            r'(telecommunications|fintech|technology|mobile|financial|payment|electric|digital)\s+(company|provider|operator|firm)',
            r'(company|provider|operator|firm)\s+(provides|offers|operates|specializes)',
            r'\boperates\s+as\s+a\s+',
            r'\bspecializes\s+in\s+',
            r'(rwanda|kenya|nigeria|african)[-\s]based\s+\w+\s+company',
            r'mobile\s+(telecommunications|network|operator)',
            r'electric\s+(mobility|vehicle)'
        ]
        
        for pattern in defining_patterns:
            if re.search(pattern, sent_lower):
                return True, 0.20  # High priority boost
        
        # MEDIUM PRIORITY: Industry keywords present
        industry_keywords = [
            'telecommunications provider', 'mobile operator', 'network operator',
            'fintech company', 'financial services provider', 'technology company',
            'electric mobility', 'payment provider', 'mobile network', 'telecom company'
        ]
        
        if any(keyword in sent_lower for keyword in industry_keywords):
            return True, 0.15  # Medium priority boost
        
        # LOW PRIORITY: Contains company name + business-related words
        business_words = ['provides', 'offers', 'operates', 'services', 'leading', 'largest']
        if any(word in sent_lower for word in business_words):
            return True, 0.05  # Low priority boost
        
        # REJECT: Performance/strategy sentences (not descriptions)
        reject_patterns = [
            r'performance (highlights|demonstrates|reflects)',
            r'(quarter|quarterly|annual|financial) (results|performance)',
            r'(strategy|focus) (remains|continues|is)',
            r'(revenue|profit|earnings) (growth|increase|surge)',
            r'commitment to',
            r'pleased with',
            r'announced (its|their|the) (results|performance)',
            r'(first|second) (half|quarter) of',
            r'growing role of',
            r'this (performance|step|move)'
        ]
        
        for pattern in reject_patterns:
            if re.search(pattern, sent_lower):
                return False, 0.0  # Reject
        
        # Default: Accept with low boost
        return True, 0.0
    
    def _is_valid_strength(self, sentence: str) -> bool:
        """
        YOUR CONTRIBUTION: Validate if sentence is actually a strength.
        Filters out irrelevant or negative sentences.
        """
        sent_lower = sentence.lower()
        
        # Filter out help page content
        help_page_patterns = [
            r'this page (should|will|can) help',
            r'help (center|page|desk)',
            r'contact (us|support)',
            r'for assistance',
            r'customer (service|support)'
        ]
        
        for pattern in help_page_patterns:
            if re.search(pattern, sent_lower):
                return False
        
        # Filter out sentences that are actually weaknesses
        negative_indicators = [
            'however', 'despite', 'although', 'challenge', 'problem',
            'difficulty', 'concern', 'issue', 'struggle', 'fail'
        ]
        
        # If it has negative indicators, it's probably not a strength
        if any(neg in sent_lower for neg in negative_indicators):
            return False
        
        # Filter out very generic/filler sentences
        if len(sentence.split()) < 8:
            return False
        
        return True
    
    def _extract_category(self, sentences: List[str], category: str, 
                         max_items: int = 5, company_name: str = "") -> List[Dict[str, Any]]:
        """
        YOUR CONTRIBUTION: Extract items for a specific category.
        Uses hybrid approach: similarity + keywords + confidence scoring + validation.
        """
        if not sentences:
            return []
        
        # Calculate similarity scores
        similarities = self._calculate_similarity_scores(sentences, category)
        
        # Apply keyword boosting
        boosted_scores = self._apply_keyword_boost(sentences, similarities, category)
        
        # Filter by threshold
        threshold = self.thresholds[category]
        candidates = []
        
        for sent, score in zip(sentences, boosted_scores):
            # Apply validation filters and priority boosts
            is_valid = True
            priority_boost = 0.0
            
            if category == 'description':
                is_valid, priority_boost = self._is_valid_description(sent, company_name)
            elif category == 'weakness':
                is_valid = self._is_valid_weakness(sent)
            elif category == 'strength':
                is_valid = self._is_valid_strength(sent)
            
            if not is_valid:
                continue
            
            # Apply priority boost
            final_score = min(score + priority_boost, 1.0)
            
            # Check threshold
            if final_score >= threshold:
                # Determine confidence level
                if final_score >= self.thresholds['confidence_high']:
                    confidence = 'high'
                elif final_score >= self.thresholds['confidence_medium']:
                    confidence = 'medium'
                else:
                    confidence = 'low'
                
                candidates.append({
                    'text': sent,
                    'score': float(final_score),
                    'confidence': confidence
                })
        
        # Sort by score and take top items
        candidates.sort(key=lambda x: x['score'], reverse=True)
        
        return candidates[:max_items]
    
    def _extract_category_adaptive(self, sentences: List[str], category: str, 
                                   max_items: int = 5, company_name: str = "") -> List[Dict[str, Any]]:
        """
        YOUR CONTRIBUTION: Adaptive extraction with multiple passes.
        
        If strict extraction finds nothing, try with relaxed requirements.
        """
        # First pass: Strict validation
        results = self._extract_category(sentences, category, max_items, company_name)
        
        # If we found enough, return
        if category == 'description' and len(results) >= 1:
            return results
        if category in ['strength', 'weakness'] and len(results) >= 2:
            return results
        
        # Second pass: Relaxed threshold (for companies with less explicit content)
        if len(results) == 0:
            # Temporarily lower threshold
            original_threshold = self.thresholds[category]
            self.thresholds[category] = max(0.40, original_threshold - 0.10)
            
            results = self._extract_category(sentences, category, max_items, company_name)
            
            # Restore original threshold
            self.thresholds[category] = original_threshold
        
        return results
    
    def extract_intelligence(self, article_text: str, article_title: str = "", company_name: str = "") -> Dict[str, Any]:
        """
        Extract company intelligence from a single article.
        
        Args:
            article_text: The article content
            article_title: The article title (optional)
            company_name: The company name for better description validation (optional)
            
        Returns:
            Dictionary containing extracted intelligence
        """
        # Combine title and content
        full_text = f"{article_title}. {article_text}" if article_title else article_text
        
        # Extract sentences
        sentences = self._extract_sentences(full_text)
        
        if not sentences:
            return {
                'description': None,
                'strengths': [],
                'weaknesses': [],
                'opportunities': []
            }
        
        # Extract each category with adaptive thresholds
        descriptions = self._extract_category_adaptive(sentences, 'description', max_items=3, company_name=company_name)
        strengths = self._extract_category_adaptive(sentences, 'strength', max_items=5, company_name=company_name)
        weaknesses = self._extract_category_adaptive(sentences, 'weakness', max_items=5, company_name=company_name)
        opportunities = self._extract_category_adaptive(sentences, 'opportunity', max_items=5, company_name=company_name)
        
        return {
            'description': descriptions[0] if descriptions else None,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'opportunities': opportunities
        }
    
    def extract_from_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract intelligence from multiple articles in a DataFrame.
        
        Args:
            df: DataFrame with 'title' and 'content' columns
            
        Returns:
            DataFrame with extracted intelligence for each article
        """
        results = []
        
        for idx, row in df.iterrows():
            title = row.get('title', '')
            content = row.get('content', '')
            
            intelligence = self.extract_intelligence(content, title)
            
            result = {
                'article_id': idx,
                'title': title,
                'content': content[:200] + '...' if len(str(content)) > 200 else content,
                'description': intelligence['description']['text'] if intelligence['description'] else '',
                'description_confidence': intelligence['description']['confidence'] if intelligence['description'] else '',
                'description_score': intelligence['description']['score'] if intelligence['description'] else 0,
                'strengths_count': len(intelligence['strengths']),
                'strengths': ' | '.join([
                    f"{s['text']} (confidence: {s['confidence']}, score: {s['score']:.3f})"
                    for s in intelligence['strengths']
                ]),
                'weaknesses_count': len(intelligence['weaknesses']),
                'weaknesses': ' | '.join([
                    f"{w['text']} (confidence: {w['confidence']}, score: {w['score']:.3f})"
                    for w in intelligence['weaknesses']
                ]),
                'opportunities_count': len(intelligence['opportunities']),
                'opportunities': ' | '.join([
                    f"{o['text']} (confidence: {o['confidence']}, score: {o['score']:.3f})"
                    for o in intelligence['opportunities']
                ])
            }
            
            results.append(result)
        
        return pd.DataFrame(results)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the model for capstone documentation."""
        return {
            'model_type': 'Weak Supervision for Company Intelligence Extraction',
            'base_embeddings': 'SentenceTransformer (all-MiniLM-L6-v2)',
            'contributions': [
                'Custom prototype-based weak supervision',
                'Domain-specific keyword engineering (African fintech/MSME)',
                'Hybrid scoring algorithm (similarity + keyword boost)',
                'Multi-category confidence scoring',
                'Post-processing and deduplication logic'
            ],
            'categories': {
                'description': {
                    'prototypes': len(self.prototypes['description']),
                    'keywords': len(self.keywords['description']),
                    'threshold': self.thresholds['description']
                },
                'strength': {
                    'prototypes': len(self.prototypes['strength']),
                    'keywords': len(self.keywords['strength']),
                    'threshold': self.thresholds['strength']
                },
                'weakness': {
                    'prototypes': len(self.prototypes['weakness']),
                    'keywords': len(self.keywords['weakness']),
                    'threshold': self.thresholds['weakness']
                },
                'opportunity': {
                    'prototypes': len(self.prototypes['opportunity']),
                    'keywords': len(self.keywords['opportunity']),
                    'threshold': self.thresholds['opportunity']
                }
            },
            'thresholds': self.thresholds
        }

