
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

    def __init__(self, model_dir: str = "ml_models/summarization"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)

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

        self.min_summary_sentences = 1
        self.max_summary_sentences = 4
        self.target_compression_ratio = 0.25
        self.min_sentence_length = 15
        self.max_sentence_length = 150

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

        self.training_data = []
        self.is_trained = False

    def preprocess_text(self, text: str) -> str:
        if not text or pd.isna(text):
            return ""

        text = str(text).strip()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        text = re.sub(r'[^\w\s.,!?;:\-$%]', '', text)

        return text.strip()

    def extract_sentences(self, text: str) -> List[str]:
        if not text:
            return []

        clean_text = self.preprocess_text(text)

        if NLTK_AVAILABLE:
            try:
                sentences = sent_tokenize(clean_text)
            except Exception:
                sentences = re.split(r'[.!?]+', clean_text)
                sentences = [s.strip() for s in sentences if s.strip()]
        else:
            sentences = re.split(r'[.!?]+', clean_text)
            sentences = [s.strip() for s in sentences if s.strip()]

        filtered_sentences = []
        for sent in sentences:
            sent = sent.strip()
            if (self.min_sentence_length <= len(sent) <= self.max_sentence_length and
                len(sent.split()) >= 3 and
                self._is_valid_sentence(sent)):
                filtered_sentences.append(sent)

        return filtered_sentences

    def _is_valid_sentence(self, sentence: str) -> bool:
        invalid_patterns = [
            r'click here', r'read more', r'subscribe', r'follow us',
            r'share this', r'comment below', r'sign up', r'register now'
        ]

        sentence_lower = sentence.lower()
        for pattern in invalid_patterns:
            if re.search(pattern, sentence_lower):
                return False

        words = sentence.split()
        content_words = [w for w in words if w.lower() not in self.stop_words]
        if len(content_words) < 2:
            return False

        return True

    def _detect_named_entities(self, sentence: str) -> int:
        words = sentence.split()
        entities = 0

        for i, word in enumerate(words):
            if i == 0:
                continue
            if word and word[0].isupper() and word.lower() not in self.stop_words:
                entities += 1

        return entities

    def _detect_numerical_data(self, sentence: str) -> int:
        num_count = 0

        num_count += len(re.findall(r'\b\d+\b', sentence))
        num_count += len(re.findall(r'\d+%', sentence))
        num_count += len(re.findall(r'[$€£¥]\s*\d+', sentence))
        num_count += len(re.findall(r'\d+\s*(million|billion|thousand|trillion)', sentence, re.I))

        return num_count

    def _calculate_semantic_importance(self, sentences: List[str]) -> List[float]:
        if len(sentences) <= 1:
            return [1.0] * len(sentences)

        try:
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(sentences)

            similarity_matrix = cosine_similarity(tfidf_matrix)

            centrality_scores = similarity_matrix.sum(axis=1)

            max_score = max(centrality_scores) if max(centrality_scores) > 0 else 1
            normalized_scores = centrality_scores / max_score

            return normalized_scores.tolist()
        except Exception:
            return [1.0] * len(sentences)

    def calculate_enhanced_features(self, sentences: List[str], title: str = "",
                                   domain: str = 'general') -> Dict[str, List[float]]:
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

        lengths = [len(sent.split()) for sent in sentences]
        max_length = max(lengths) if lengths else 1
        features['length_score'] = [1 - abs(len(sent.split()) - 20) / max_length for sent in sentences]

        total_sentences = len(sentences)
        for i in range(total_sentences):
            if i < 2:
                position_score = 1.0
            elif i >= total_sentences - 1:
                position_score = 0.8
            else:
                position_score = 0.5
            features['position_score'].append(position_score)

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

        keywords = self.domain_keywords.get(domain, self.domain_keywords['general'])
        for sent in sentences:
            sent_lower = sent.lower()
            keyword_count = sum(1 for word in keywords if word in sent_lower)
            density = keyword_count / max(len(sent.split()), 1)
            features['keyword_density'].append(density)

        for sent in sentences:
            entity_count = self._detect_named_entities(sent)
            entity_score = entity_count / max(len(sent.split()), 1)
            features['entity_score'].append(entity_score)

        for sent in sentences:
            num_count = self._detect_numerical_data(sent)
            num_score = min(num_count / 3, 1.0)
            features['numerical_score'].append(num_score)

        centrality_scores = self._calculate_semantic_importance(sentences)
        features['semantic_centrality'] = centrality_scores

        return features

    def rank_sentences(self, sentences: List[str], title: str = "",
                      domain: str = 'general') -> List[Tuple[str, float]]:
        if not sentences:
            return []

        features = self.calculate_enhanced_features(sentences, title, domain)

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

        sentence_scores = []
        for i, sent in enumerate(sentences):
            score = 0
            for feature_name, weight in weights.items():
                if feature_name in features and i < len(features[feature_name]):
                    score += weight * features[feature_name][i]
            sentence_scores.append((sent, score))

        sentence_scores.sort(key=lambda x: x[1], reverse=True)

        return sentence_scores

    def _determine_summary_length(self, text: str) -> int:
        word_count = len(text.split())

        if word_count < 50:
            return 1
        elif word_count < 150:
            return 2
        elif word_count < 300:
            return 3
        else:
            return min(4, max(2, int(word_count * 0.15 / 20)))

    def summarize(self, text: str, title: str = "", max_sentences: int = None,
                 domain: str = 'general') -> str:
        if not text or pd.isna(text):
            return ""

        sentences = self.extract_sentences(text)
        if not sentences:
            return ""

        if max_sentences is None:
            max_sent = self._determine_summary_length(text)
        else:
            max_sent = max_sentences

        if len(sentences) <= max_sent:
            return ' '.join(sentences)

        ranked_sentences = self.rank_sentences(sentences, title, domain)

        selected_sentences = []
        selected_sentences.append(ranked_sentences[0])

        for i in range(1, min(len(ranked_sentences), max_sent * 2)):
            candidate = ranked_sentences[i]

            is_diverse = True
            for selected in selected_sentences:
                if self._calculate_sentence_similarity(selected[0], candidate[0]) > 0.7:
                    is_diverse = False
                    break

            if is_diverse:
                selected_sentences.append(candidate)

            if len(selected_sentences) >= max_sent:
                break

        selected_sentences.sort(key=lambda x: sentences.index(x[0]))

        summary = ' '.join([sent[0] for sent in selected_sentences])

        summary = self._clean_summary(summary)

        return summary.strip()

    def _calculate_sentence_similarity(self, sent1: str, sent2: str) -> float:
        words1 = set(sent1.lower().split())
        words2 = set(sent2.lower().split())

        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))

        return intersection / max(union, 1)

    def _clean_summary(self, summary: str) -> str:
        summary = re.sub(r'\s+', ' ', summary)

        if summary and not summary.endswith(('.', '!', '?')):
            summary += '.'

        if summary:
            summary = summary[0].upper() + summary[1:]

        return summary.strip()

    def evaluate_summary_quality(self, original_text: str, summary: str) -> Dict[str, float]:
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

        quality_score = (1 - compression_ratio) * 0.3 + coverage * 0.7

        return {
            'compression_ratio': compression_ratio,
            'coverage': coverage,
            'quality_score': quality_score
        }

    def save_model(self, filename: str = "enhanced_summarization_model.pkl"):
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

