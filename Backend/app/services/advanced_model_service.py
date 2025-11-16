import pickle
import json
import numpy as np
import pandas as pd
from pathlib import Path
from sentence_transformers import SentenceTransformer, util
from typing import Dict, List, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

class AdvancedModelService:

    def __init__(self, model_path: str = "ml_models/classification/best_model"):
        self.model_path = Path(model_path)
        self.model = None
        self.scaler = None
        self.sentence_model = None
        self.config = None
        self._load_model()

    def _load_model(self):
        try:
            if not self.model_path.exists():
                print(f"Model directory not found: {self.model_path}")
                print("Model will be loaded on first use")
                return

            config_file = self.model_path / "model_config.json"
            if not config_file.exists():
                print(f"Model config file not found: {config_file}")
                print("Model will be loaded on first use")
                return

            with open(config_file, 'r') as f:
                self.config = json.load(f)

            classifier_file = self.model_path / "best_classifier.pkl"
            if not classifier_file.exists():
                print(f"Classifier file not found: {classifier_file}")
                print("Model will be loaded on first use")
                return

            with open(classifier_file, 'rb') as f:
                self.model = pickle.load(f)

            scaler_file = self.model_path / "scaler.pkl"
            if not scaler_file.exists():
                print(f"Scaler file not found: {scaler_file}")
                print("Model will be loaded on first use")
                return

            with open(scaler_file, 'rb') as f:
                self.scaler = pickle.load(f)

            sentence_model_info = self.model_path / "sentence_model_info.json"
            # Force CPU device to prevent MPS/SIGSEGV crashes
            import torch
            device = 'cpu'  # Always use CPU
            if sentence_model_info.exists():
                with open(sentence_model_info, 'r') as f:
                    model_info = json.load(f)
                self.sentence_model = SentenceTransformer(model_info['model_name'], device=device)
            else:
                self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2', device=device)

            print(f"Model loaded successfully: {self.config['model_type']}")
            print(f"Model performance: F1={self.config['performance_metrics']['f1_score']:.3f}")

        except Exception as e:
            print(f"Error loading model: {str(e)}")
            print("Model will be loaded on first use")

    def is_model_loaded(self) -> bool:
        return all([
            self.model is not None,
            self.scaler is not None,
            self.sentence_model is not None,
            self.config is not None
        ])

    def load_model_on_demand(self):
        if not self.is_model_loaded():
            self._load_model()

    def _create_weak_labels(self, texts: List[str], company_objective: str,
                          direct_threshold: float = 0.65, indirect_threshold: float = 0.45) -> Tuple[List[int], List[float]]:

        objectives_embedding = self.sentence_model.encode(company_objective, normalize_embeddings=True)

        labels = []
        similarities = []

        batch_size = 256
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_embeddings = self.sentence_model.encode(batch_texts, normalize_embeddings=True)

            batch_similarities = util.cos_sim(batch_embeddings, objectives_embedding).cpu().numpy().flatten()
            similarities.extend(batch_similarities.tolist())

        similarities = self._apply_keyword_boost(texts, similarities)

        for sim in similarities:
            if sim >= direct_threshold:
                labels.append(2)
            elif sim >= indirect_threshold:
                labels.append(1)
            else:
                labels.append(0)

        return labels, similarities

    def _apply_keyword_boost(self, texts: List[str], similarities: List[float]) -> List[float]:

        direct_keywords = {
            "online marketplace", "marketplace", "e-commerce", "ecommerce", "digital commerce",
            "secure transactions", "secure payment", "payment security", "transaction security",
            "partnership", "partnerships", "partner", "collaboration", "alliance",
            "digital payments", "online payment", "payment gateway", "payment processing",
            "fintech", "financial technology", "digital finance", "financial services",
            "mobile wallet", "digital wallet", "wallet", "payments", "payment solutions",
            "pos", "point of sale", "card", "cards", "tap to pay", "qr code", "qr",
            "merchant", "merchants", "merchant services", "acquiring", "issuing",
            "financial inclusion", "digital financial services", "payment infrastructure"
        }

        indirect_keywords = {
            "africa", "african", "nigeria", "kenya", "ghana", "rwanda", "ethiopia",
            "uganda", "tanzania", "south africa", "cote d'ivoire", "ivory coast",
            "senegal", "economic development", "business development", "trade",
            "small business", "sme", "smes", "micro business", "entrepreneurship",
            "startup", "startups", "innovation", "technology", "digital transformation",
            "financial access", "banking", "financial services", "credit", "lending"
        }

        penalty_keywords = {
            "agriculture", "farming", "crop", "crops", "livestock", "food security",
            "climate change", "environment", "water", "healthcare", "medical", "health",
            "education", "school", "university", "student", "scholar", "scholarship",
            "humanitarian", "aid", "development", "ngo", "foundation", "charity"
        }

        boosted_similarities = []

        for text, sim in zip(texts, similarities):
            text_lower = text.lower()
            boost = 0.0

            direct_matches = sum(1 for keyword in direct_keywords if keyword in text_lower)
            indirect_matches = sum(1 for keyword in indirect_keywords if keyword in text_lower)
            penalty_matches = sum(1 for keyword in penalty_keywords if keyword in text_lower)

            if direct_matches >= 2:
                boost += 0.15
            elif direct_matches == 1:
                boost += 0.10
            elif indirect_matches >= 3:
                boost += 0.08
            elif indirect_matches >= 1:
                boost += 0.05

            if penalty_matches >= 2:
                boost -= 0.10
            elif penalty_matches == 1:
                boost -= 0.05

            boost = max(-0.15, min(0.20, boost))

            boosted_sim = max(0.0, min(1.0, sim + boost))
            boosted_similarities.append(boosted_sim)

        return boosted_similarities

    def _apply_hybrid_classification(self, df: pd.DataFrame, company_objective: str) -> pd.DataFrame:

        df_hybrid = df.copy()

        high_confidence_threshold = 0.85
        medium_confidence_threshold = 0.70

        for idx, row in df_hybrid.iterrows():
            ml_prediction = row['prediction']
            ml_confidence = row['confidence_score']
            weak_similarity = row['weak_similarity_score']
            weak_label = row['weak_label']

            if (ml_confidence >= high_confidence_threshold and
                weak_similarity >= 0.60 and
                ml_prediction == weak_label):
                continue

            elif weak_similarity < 0.30:
                df_hybrid.loc[idx, 'prediction'] = 0
                df_hybrid.loc[idx, 'prediction_label'] = 'Not Relevant'
                df_hybrid.loc[idx, 'probability_not_relevant'] = 0.95
                df_hybrid.loc[idx, 'probability_indirectly_useful'] = 0.04
                df_hybrid.loc[idx, 'probability_directly_relevant'] = 0.01
                df_hybrid.loc[idx, 'confidence_score'] = 0.95

            elif (ml_confidence < medium_confidence_threshold and
                  weak_similarity < 0.45 and
                  ml_prediction != 0):
                df_hybrid.loc[idx, 'prediction'] = 0
                df_hybrid.loc[idx, 'prediction_label'] = 'Not Relevant'
                df_hybrid.loc[idx, 'probability_not_relevant'] = 0.90
                df_hybrid.loc[idx, 'probability_indirectly_useful'] = 0.08
                df_hybrid.loc[idx, 'probability_directly_relevant'] = 0.02
                df_hybrid.loc[idx, 'confidence_score'] = 0.90

            elif (weak_similarity >= 0.65 and
                  ml_confidence < medium_confidence_threshold and
                  weak_label != 0):
                df_hybrid.loc[idx, 'prediction'] = weak_label
                df_hybrid.loc[idx, 'prediction_label'] = row['weak_label_name']
                if weak_label == 1:
                    df_hybrid.loc[idx, 'probability_indirectly_useful'] = 0.85
                    df_hybrid.loc[idx, 'probability_not_relevant'] = 0.10
                    df_hybrid.loc[idx, 'probability_directly_relevant'] = 0.05
                elif weak_label == 2:
                    df_hybrid.loc[idx, 'probability_directly_relevant'] = 0.85
                    df_hybrid.loc[idx, 'probability_indirectly_useful'] = 0.10
                    df_hybrid.loc[idx, 'probability_not_relevant'] = 0.05
                df_hybrid.loc[idx, 'confidence_score'] = 0.85

        return df_hybrid

    def classify_articles(self, df: pd.DataFrame, company_objective: str,
                         use_custom_objective: bool = True) -> Dict[str, Any]:

        self.load_model_on_demand()

        if not self.is_model_loaded():
            raise RuntimeError("Model is not loaded. Please ensure model files exist.")

        df = df.copy()
        if 'combined_text' not in df.columns:
            df['title_clean'] = df['title'].fillna('').astype(str)
            df['content_clean'] = df['content'].fillna('').astype(str)
            df['combined_text'] = df['title_clean'] + ' ' + df['content_clean']

        texts = df['combined_text'].tolist()

        print("Generating embeddings...")
        embeddings = self.sentence_model.encode(texts, convert_to_tensor=False, normalize_embeddings=True)

        embeddings_scaled = self.scaler.transform(embeddings)

        predictions = self.model.predict(embeddings_scaled)
        probabilities = self.model.predict_proba(embeddings_scaled)

        label_mapping = {int(k): v for k, v in self.config['label_mapping'].items()}
        prediction_labels = [label_mapping[pred] for pred in predictions]

        confidence_scores = np.max(probabilities, axis=1)

        df['prediction'] = predictions
        df['prediction_label'] = prediction_labels
        df['confidence_score'] = confidence_scores
        df['probability_not_relevant'] = probabilities[:, 0]
        df['probability_indirectly_useful'] = probabilities[:, 1]
        df['probability_directly_relevant'] = probabilities[:, 2]

        if use_custom_objective:
            weak_labels, similarities = self._create_weak_labels(texts, company_objective)
            df['weak_similarity_score'] = similarities
            df['weak_label'] = weak_labels
            df['weak_label_name'] = [label_mapping[label] for label in weak_labels]

            df = self._apply_hybrid_classification(df, company_objective)

        summary = self._create_summary(df, company_objective, use_custom_objective)

        results = []
        for _, row in df.iterrows():
            result = {
                'title': row['title'],
                'content': row['content'][:500] + '...' if len(str(row['content'])) > 500 else row['content'],
                'prediction': row['prediction'],
                'prediction_label': row['prediction_label'],
                'confidence_score': float(row['confidence_score']),
                'probabilities': {
                    'not_relevant': float(row['probability_not_relevant']),
                    'indirectly_useful': float(row['probability_indirectly_useful']),
                    'directly_relevant': float(row['probability_directly_relevant'])
                }
            }

            if use_custom_objective:
                result.update({
                    'weak_similarity_score': float(row['weak_similarity_score']),
                    'weak_label': int(row['weak_label']),
                    'weak_label_name': row['weak_label_name']
                })

            results.append(result)

        return {
            'results': results,
            'summary': summary,
            'model_info': {
                'model_type': self.config['model_type'],
                'performance_metrics': self.config['performance_metrics'],
                'training_data_size': self.config['training_data']['total_samples']
            }
        }

    def _create_summary(self, df: pd.DataFrame, company_objective: str, use_custom_objective: bool) -> Dict[str, Any]:

        prediction_counts = df['prediction_label'].value_counts().to_dict()

        avg_confidence = df['confidence_score'].mean()

        high_confidence = df[df['confidence_score'] > 0.8]
        high_confidence_count = len(high_confidence)

        summary = {
            'total_articles': len(df),
            'prediction_distribution': prediction_counts,
            'average_confidence': float(avg_confidence),
            'high_confidence_predictions': high_confidence_count,
            'company_objective': company_objective
        }

        if use_custom_objective:
            weak_counts = df['weak_label_name'].value_counts().to_dict()
            summary['weak_supervision_distribution'] = weak_counts

            agreement = (df['prediction_label'] == df['weak_label_name']).mean()
            summary['model_weak_supervision_agreement'] = float(agreement)

        return summary
