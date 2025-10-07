"""Enhanced summarization model with improved features."""

import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

try:
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.corpus import stopwords
    from nltk.stem import PorterStemmer
    import nltk
    
    # Download required NLTK data
    try:
        nltk.data.find('tokenizers/punkt')
    except (LookupError, Exception):
        try:
            nltk.download('punkt')
        except Exception as e:
            print(f"Warning: Could not download NLTK punkt data: {e}")
    
    try:
        nltk.data.find('corpora/stopwords')
    except (LookupError, Exception):
        try:
            nltk.download('stopwords')
        except Exception as e:
            print(f"Warning: Could not download NLTK stopwords data: {e}")
    
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    print("Warning: NLTK not available. Using fallback text processing.")

class EnhancedSummarizationModel:
    """
    Enhanced extractive summarization model with advanced features:
    - Dynamic summary length
    - Named entity detection
    - Numerical data prioritization
    - Domain-specific keywords
    - Improved sentence ranking
    """
    
    def __init__(self, model_dir: str = "ml_models/summarization"):
        """Initialize the enhanced summarization model."""
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        if NLTK_AVAILABLE:
            self.stemmer = PorterStemmer()
            self.stop_words = set(stopwords.words('english'))
        else:
            self.stemmer = None
            self.stop_words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
        
        # Model parameters - dynamic based on content length
        self.min_summary_sentences = 1
        self.max_summary_sentences = 4
        self.target_compression_ratio = 0.25  # Target 25% of original
        self.min_sentence_length = 15
        self.max_sentence_length = 150
        
        # Enhanced keyword sets by domain
        self.domain_keywords = {
            'fintech': [
                'fund', 'funding', 'investment', 'financing', 'capital', 'venture',
                'payment', 'mobile money', 'digital wallet', 'transaction', 'fintech',
                'startup', 'partnership', 'launch', 'announce', 'expansion',
                'million', 'billion', 'raise', 'valuation', 'revenue'
            ],
            'healthcare': [
                'health', 'medical', 'patient', 'treatment', 'diagnosis', 'cure',
                'hospital', 'clinic', 'doctor', 'research', 'study', 'trial',
                'vaccine', 'drug', 'therapy', 'disease', 'innovation'
            ],
            'technology': [
                'technology', 'innovation', 'digital', 'platform', 'software',
                'app', 'application', 'launch', 'release', 'update', 'feature',
                'AI', 'artificial intelligence', 'machine learning', 'cloud'
            ],
            'general': [
                'announce', 'launch', 'introduce', 'develop', 'create', 'build',
                'expand', 'grow', 'partnership', 'collaboration', 'agreement',
                'million', 'billion', 'percent', 'increase', 'new', 'first'
            ]
        }
        
        # Training data
        self.training_data = []
        self.is_trained = False
        
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text."""
        if not text or pd.isna(text):
            return ""
        
        text = str(text).strip()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        text = re.sub(r'[^\w\s.,!?;:\-$%]', '', text)
        
        return text.strip()
    
    def extract_sentences(self, text: str) -> List[str]:
        """Extract sentences from text."""
        if not text:
            return []
        
        clean_text = self.preprocess_text(text)
        
        # Split into sentences
        if NLTK_AVAILABLE:
            try:
                sentences = sent_tokenize(clean_text)
            except Exception:
                sentences = re.split(r'[.!?]+', clean_text)
                sentences = [s.strip() for s in sentences if s.strip()]
        else:
            sentences = re.split(r'[.!?]+', clean_text)
            sentences = [s.strip() for s in sentences if s.strip()]
        
        # Filter sentences by length and quality
        filtered_sentences = []
        for sent in sentences:
            sent = sent.strip()
            if (self.min_sentence_length <= len(sent) <= self.max_sentence_length and 
                len(sent.split()) >= 3 and
                self._is_valid_sentence(sent)):
                filtered_sentences.append(sent)
        
        return filtered_sentences
    
    def _is_valid_sentence(self, sentence: str) -> bool:
        """Check if sentence is valid for summarization."""
        # Remove promotional/meta sentences
        invalid_patterns = [
            r'click here', r'read more', r'subscribe', r'follow us',
            r'share this', r'comment below', r'sign up', r'register now'
        ]
        
        sentence_lower = sentence.lower()
        for pattern in invalid_patterns:
            if re.search(pattern, sentence_lower):
                return False
        
        # Ensure sentence has some content words
        words = sentence.split()
        content_words = [w for w in words if w.lower() not in self.stop_words]
        if len(content_words) < 2:
            return False
        
        return True
    
    def _detect_named_entities(self, sentence: str) -> int:
        """Detect named entities in sentence (simple heuristic)."""
        # Look for capitalized words (potential entities)
        words = sentence.split()
        entities = 0
        
        for i, word in enumerate(words):
            # Skip first word (might be capitalized anyway)
            if i == 0:
                continue
            # Check if word is capitalized and not a common word
            if word and word[0].isupper() and word.lower() not in self.stop_words:
                entities += 1
        
        return entities
    
    def _detect_numerical_data(self, sentence: str) -> int:
        """Detect numerical data in sentence."""
        # Count numbers, percentages, currency
        num_count = 0
        
        # Numbers
        num_count += len(re.findall(r'\b\d+\b', sentence))
        # Percentages
        num_count += len(re.findall(r'\d+%', sentence))
        # Currency
        num_count += len(re.findall(r'[$€£¥]\s*\d+', sentence))
        num_count += len(re.findall(r'\d+\s*(million|billion|thousand|trillion)', sentence, re.I))
        
        return num_count
    
    def _calculate_semantic_importance(self, sentences: List[str]) -> List[float]:
        """Calculate semantic importance using sentence similarity."""
        if len(sentences) <= 1:
            return [1.0] * len(sentences)
        
        try:
            # Create TF-IDF matrix
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(sentences)
            
            # Calculate similarity matrix
            similarity_matrix = cosine_similarity(tfidf_matrix)
            
            # Calculate centrality scores (sum of similarities to other sentences)
            centrality_scores = similarity_matrix.sum(axis=1)
            
            # Normalize
            max_score = max(centrality_scores) if max(centrality_scores) > 0 else 1
            normalized_scores = centrality_scores / max_score
            
            return normalized_scores.tolist()
        except Exception:
            return [1.0] * len(sentences)
    
    def calculate_enhanced_features(self, sentences: List[str], title: str = "", 
                                   domain: str = 'general') -> Dict[str, List[float]]:
        """Calculate enhanced features for sentence ranking."""
        if not sentences:
            return {}
        
        features = {
            'length_score': [],
            'position_score': [],
            'title_similarity': [],
            'tfidf_score': [],
            'keyword_density': [],
            'entity_score': [],
            'numerical_score': [],
            'semantic_centrality': []
        }
        
        # Calculate length scores
        lengths = [len(sent.split()) for sent in sentences]
        max_length = max(lengths) if lengths else 1
        features['length_score'] = [1 - abs(len(sent.split()) - 20) / max_length for sent in sentences]
        
        # Calculate position scores (favor beginning and end)
        total_sentences = len(sentences)
        for i in range(total_sentences):
            if i < 2:  # First two sentences
                position_score = 1.0
            elif i >= total_sentences - 1:  # Last sentence
                position_score = 0.8
            else:
                position_score = 0.5
            features['position_score'].append(position_score)
        
        # Calculate title similarity
        if title:
            if NLTK_AVAILABLE:
                try:
                    title_words = set(word_tokenize(title.lower()))
                except Exception:
                    title_words = set(title.lower().split())
            else:
                title_words = set(title.lower().split())
            
            for sent in sentences:
                if NLTK_AVAILABLE:
                    try:
                        sent_words = set(word_tokenize(sent.lower()))
                    except Exception:
                        sent_words = set(sent.lower().split())
                else:
                    sent_words = set(sent.lower().split())
                
                common_words = len(title_words.intersection(sent_words))
                similarity = common_words / max(len(title_words), 1)
                features['title_similarity'].append(similarity)
        else:
            features['title_similarity'] = [0] * len(sentences)
        
        # Calculate TF-IDF scores
        if len(sentences) > 1:
            try:
                tfidf_matrix = self.tfidf_vectorizer.fit_transform(sentences)
                tfidf_scores = np.array(tfidf_matrix.sum(axis=1)).flatten()
                max_tfidf = max(tfidf_scores) if max(tfidf_scores) > 0 else 1
                features['tfidf_score'] = (tfidf_scores / max_tfidf).tolist()
            except:
                features['tfidf_score'] = [1.0] * len(sentences)
        else:
            features['tfidf_score'] = [1.0] * len(sentences)
        
        # Calculate keyword density (domain-specific)
        keywords = self.domain_keywords.get(domain, self.domain_keywords['general'])
        for sent in sentences:
            sent_lower = sent.lower()
            keyword_count = sum(1 for word in keywords if word in sent_lower)
            density = keyword_count / max(len(sent.split()), 1)
            features['keyword_density'].append(density)
        
        # Calculate entity scores
        for sent in sentences:
            entity_count = self._detect_named_entities(sent)
            # Normalize by sentence length
            entity_score = entity_count / max(len(sent.split()), 1)
            features['entity_score'].append(entity_score)
        
        # Calculate numerical data scores
        for sent in sentences:
            num_count = self._detect_numerical_data(sent)
            # Normalize
            num_score = min(num_count / 3, 1.0)  # Cap at 1.0
            features['numerical_score'].append(num_score)
        
        # Calculate semantic centrality
        centrality_scores = self._calculate_semantic_importance(sentences)
        features['semantic_centrality'] = centrality_scores
        
        return features
    
    def rank_sentences(self, sentences: List[str], title: str = "", 
                      domain: str = 'general') -> List[Tuple[str, float]]:
        """Rank sentences based on enhanced features."""
        if not sentences:
            return []
        
        # Calculate features
        features = self.calculate_enhanced_features(sentences, title, domain)
        
        # Enhanced weighted scoring
        weights = {
            'length_score': 0.08,
            'position_score': 0.25,
            'title_similarity': 0.30,
            'tfidf_score': 0.10,
            'keyword_density': 0.12,
            'entity_score': 0.08,
            'numerical_score': 0.05,
            'semantic_centrality': 0.02
        }
        
        # Calculate final scores
        sentence_scores = []
        for i, sent in enumerate(sentences):
            score = 0
            for feature_name, weight in weights.items():
                if feature_name in features and i < len(features[feature_name]):
                    score += weight * features[feature_name][i]
            sentence_scores.append((sent, score))
        
        # Sort by score (descending)
        sentence_scores.sort(key=lambda x: x[1], reverse=True)
        
        return sentence_scores
    
    def _determine_summary_length(self, text: str) -> int:
        """Dynamically determine optimal summary length based on text length."""
        word_count = len(text.split())
        
        if word_count < 50:
            return 1
        elif word_count < 150:
            return 2
        elif word_count < 300:
            return 3
        else:
            return min(4, max(2, int(word_count * 0.15 / 20)))  # ~15% of text, assuming ~20 words/sentence
    
    def summarize(self, text: str, title: str = "", max_sentences: int = None,
                 domain: str = 'general') -> str:
        """Generate enhanced summary for given text."""
        if not text or pd.isna(text):
            return ""
        
        # Extract sentences
        sentences = self.extract_sentences(text)
        if not sentences:
            return ""
        
        # Determine summary length
        if max_sentences is None:
            max_sent = self._determine_summary_length(text)
        else:
            max_sent = max_sentences
        
        # Don't summarize if already very short
        if len(sentences) <= max_sent:
            return ' '.join(sentences)
        
        # Rank sentences
        ranked_sentences = self.rank_sentences(sentences, title, domain)
        
        # Select top sentences with diversity
        selected_sentences = []
        selected_sentences.append(ranked_sentences[0])
        
        for i in range(1, min(len(ranked_sentences), max_sent * 2)):
            candidate = ranked_sentences[i]
            
            # Check diversity with already selected sentences
            is_diverse = True
            for selected in selected_sentences:
                if self._calculate_sentence_similarity(selected[0], candidate[0]) > 0.7:
                    is_diverse = False
                    break
            
            if is_diverse:
                selected_sentences.append(candidate)
            
            if len(selected_sentences) >= max_sent:
                break
        
        # Sort selected sentences by original order
        selected_sentences.sort(key=lambda x: sentences.index(x[0]))
        
        # Join to create summary
        summary = ' '.join([sent[0] for sent in selected_sentences])
        
        # Post-process summary
        summary = self._clean_summary(summary)
        
        return summary.strip()
    
    def _calculate_sentence_similarity(self, sent1: str, sent2: str) -> float:
        """Calculate similarity between two sentences."""
        words1 = set(sent1.lower().split())
        words2 = set(sent2.lower().split())
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / max(union, 1)
    
    def _clean_summary(self, summary: str) -> str:
        """Clean and format the summary."""
        summary = re.sub(r'\s+', ' ', summary)
        
        if summary and not summary.endswith(('.', '!', '?')):
            summary += '.'
        
        if summary:
            summary = summary[0].upper() + summary[1:]
        
        return summary.strip()
    
    def evaluate_summary_quality(self, original_text: str, summary: str) -> Dict[str, float]:
        """Evaluate the quality of a generated summary."""
        if not summary:
            return {'compression_ratio': 0, 'coverage': 0, 'quality_score': 0}
        
        original_length = len(original_text.split())
        summary_length = len(summary.split())
        compression_ratio = summary_length / max(original_length, 1)
        
        if NLTK_AVAILABLE:
            try:
                original_words = set(word_tokenize(original_text.lower()))
                summary_words = set(word_tokenize(summary.lower()))
            except Exception:
                original_words = set(original_text.lower().split())
                summary_words = set(summary.lower().split())
        else:
            original_words = set(original_text.lower().split())
            summary_words = set(summary.lower().split())
        
        coverage = len(original_words.intersection(summary_words)) / max(len(original_words), 1)
        
        # Enhanced quality score
        quality_score = (1 - compression_ratio) * 0.3 + coverage * 0.7
        
        return {
            'compression_ratio': compression_ratio,
            'coverage': coverage,
            'quality_score': quality_score
        }
    
    def save_model(self, filename: str = "enhanced_summarization_model.pkl"):
        """Save the trained model."""
        model_path = self.model_dir / filename
        
        model_data = {
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'target_compression_ratio': self.target_compression_ratio,
            'min_sentence_length': self.min_sentence_length,
            'max_sentence_length': self.max_sentence_length,
            'is_trained': self.is_trained
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Enhanced model saved to {model_path}")
    
    def load_model(self, filename: str = "enhanced_summarization_model.pkl"):
        """Load a trained model."""
        model_path = self.model_dir / filename
        
        if not model_path.exists():
            print(f"Model file {model_path} not found")
            return False
        
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.tfidf_vectorizer = model_data['tfidf_vectorizer']
            self.target_compression_ratio = model_data['target_compression_ratio']
            self.min_sentence_length = model_data['min_sentence_length']
            self.max_sentence_length = model_data['max_sentence_length']
            self.is_trained = model_data['is_trained']
            
            print(f"Enhanced model loaded from {model_path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False

