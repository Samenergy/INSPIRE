"""Service for classifying articles based on company objectives."""

import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from datetime import datetime
from pathlib import Path
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from loguru import logger

from app.models import ArticleClassificationRequest, ArticleClassificationResult, ArticleClassificationResponse


class ArticleClassificationService:
    """Service for classifying articles based on company objectives."""
    
    def __init__(self):
        self.exports_dir = Path("exports")
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        
    def classify_articles(self, request: ArticleClassificationRequest) -> ArticleClassificationResponse:
        """
        Classify articles based on company objectives and generate filtered CSV.
        
        Args:
            request: Classification request with company name, objectives, and optional CSV filename
            
        Returns:
            Classification response with results and filtered CSV path
        """
        try:
            # Load CSV files
            csv_files = self._get_csv_files(request.csv_filename)
            if not csv_files:
                raise ValueError("No CSV files found in exports directory")
            
            # Load and combine all articles
            all_articles = self._load_articles(csv_files)
            logger.info(f"Loaded {len(all_articles)} articles from {len(csv_files)} CSV files")
            
            # Prepare training data based on company objectives
            training_data = self._prepare_training_data(all_articles, request.company_name, request.company_objectives)
            
            # Train classification model
            classifier, vectorizer = self._train_classifier(training_data, request.company_name, request.company_objectives)
            
            # Classify all articles
            classified_articles = self._classify_articles_with_model(
                all_articles, classifier, vectorizer, request.company_name, request.company_objectives
            )
            
            # Generate filtered CSV
            filtered_csv_path = self._generate_filtered_csv(classified_articles, request.company_name)
            
            # Calculate results
            total_articles = len(classified_articles)
            relevant_articles = sum(1 for article in classified_articles if article['is_relevant'])
            irrelevant_articles = total_articles - relevant_articles
            relevance_score = (relevant_articles / total_articles) * 100 if total_articles > 0 else 0
            
            # Prepare classification details
            classification_details = [
                {
                    'title': article['title'],
                    'url': article['url'],
                    'source': article['source'],
                    'relevance_score': article['relevance_score'],
                    'is_relevant': article['is_relevant'],
                    'reasoning': article['reasoning']
                }
                for article in classified_articles
            ]
            
            result = ArticleClassificationResult(
                total_articles=total_articles,
                relevant_articles=relevant_articles,
                irrelevant_articles=irrelevant_articles,
                relevance_score=relevance_score,
                filtered_csv_path=filtered_csv_path,
                classification_details=classification_details
            )
            
            return ArticleClassificationResponse(
                success=True,
                message=f"Successfully classified {total_articles} articles. {relevant_articles} relevant articles found.",
                data=result
            )
            
        except Exception as e:
            logger.error(f"Error in article classification: {str(e)}")
            return ArticleClassificationResponse(
                success=False,
                message=f"Classification failed: {str(e)}",
                data=None
            )
    
    def _get_csv_files(self, specific_filename: str = None) -> List[Path]:
        """Get list of CSV files to process."""
        if specific_filename:
            csv_path = self.exports_dir / specific_filename
            if csv_path.exists():
                return [csv_path]
            else:
                raise ValueError(f"CSV file {specific_filename} not found")
        else:
            return list(self.exports_dir.glob("*.csv"))
    
    def _load_articles(self, csv_files: List[Path]) -> List[Dict[str, Any]]:
        """Load articles from CSV files."""
        all_articles = []
        
        for csv_file in csv_files:
            try:
                df = pd.read_csv(csv_file)
                
                # Ensure required columns exist
                required_columns = ['title', 'url', 'source', 'content']
                if not all(col in df.columns for col in required_columns):
                    logger.warning(f"Skipping {csv_file.name} - missing required columns")
                    continue
                
                # Convert to list of dictionaries
                for _, row in df.iterrows():
                    article = {
                        'title': str(row.get('title', '')),
                        'url': str(row.get('url', '')),
                        'source': str(row.get('source', '')),
                        'content': str(row.get('content', '')),
                        'published_date': row.get('published_date', ''),
                        'created_at': row.get('created_at', ''),
                        'csv_file': csv_file.name
                    }
                    all_articles.append(article)
                    
            except Exception as e:
                logger.error(f"Error loading {csv_file.name}: {str(e)}")
                continue
        
        return all_articles
    
    def _prepare_training_data(self, articles: List[Dict[str, Any]], company_name: str, objectives: str) -> List[Dict[str, Any]]:
        """Prepare training data for the classifier."""
        training_data = []
        
        # Create positive examples based on company name and objectives
        company_keywords = self._extract_keywords(company_name)
        objective_keywords = self._extract_keywords(objectives)
        
        for article in articles:
            # Combine title and content for analysis
            text = f"{article['title']} {article['content']}".lower()
            
            # Calculate relevance score based on keyword matching
            relevance_score = self._calculate_keyword_relevance(text, company_keywords, objective_keywords)
            
            # Label as relevant if score is above threshold
            is_relevant = relevance_score > 0.3  # Threshold can be adjusted
            
            training_data.append({
                'text': text,
                'is_relevant': is_relevant,
                'relevance_score': relevance_score,
                'article': article
            })
        
        return training_data
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text."""
        # Remove special characters and split into words
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Filter out common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
        
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        return keywords
    
    def _calculate_keyword_relevance(self, text: str, company_keywords: List[str], objective_keywords: List[str]) -> float:
        """Calculate relevance score based on keyword matching."""
        score = 0.0
        
        # Company name relevance (higher weight)
        company_matches = sum(1 for keyword in company_keywords if keyword in text)
        if company_keywords:
            score += (company_matches / len(company_keywords)) * 0.6
        
        # Objectives relevance
        objective_matches = sum(1 for keyword in objective_keywords if keyword in text)
        if objective_keywords:
            score += (objective_matches / len(objective_keywords)) * 0.4
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _train_classifier(self, training_data: List[Dict[str, Any]], company_name: str, objectives: str) -> Tuple[Any, Any]:
        """Train a classification model."""
        # Prepare text data and labels
        texts = [item['text'] for item in training_data]
        labels = [1 if item['is_relevant'] else 0 for item in training_data]
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.8
        )
        
        # Fit and transform text data
        X = vectorizer.fit_transform(texts)
        y = np.array(labels)
        
        # Train Naive Bayes classifier
        classifier = MultinomialNB()
        classifier.fit(X, y)
        
        # Save model and vectorizer
        model_filename = f"classifier_{company_name.lower().replace(' ', '_')}.joblib"
        model_path = self.models_dir / model_filename
        
        joblib.dump({
            'classifier': classifier,
            'vectorizer': vectorizer,
            'company_name': company_name,
            'objectives': objectives,
            'training_date': datetime.utcnow().isoformat()
        }, model_path)
        
        logger.info(f"Trained classifier saved to {model_path}")
        
        return classifier, vectorizer
    
    def _classify_articles_with_model(self, articles: List[Dict[str, Any]], classifier: Any, vectorizer: Any, company_name: str, objectives: str) -> List[Dict[str, Any]]:
        """Classify articles using the trained model."""
        classified_articles = []
        
        for article in articles:
            # Prepare text for classification
            text = f"{article['title']} {article['content']}"
            
            # Transform text using trained vectorizer
            text_vector = vectorizer.transform([text])
            
            # Get prediction and probability
            prediction = classifier.predict(text_vector)[0]
            probability = classifier.predict_proba(text_vector)[0]
            
            # Get relevance score (probability of being relevant)
            relevance_score = probability[1] if len(probability) > 1 else probability[0]
            
            # Determine if article is relevant
            is_relevant = prediction == 1
            
            # Generate reasoning
            reasoning = self._generate_reasoning(article, company_name, objectives, relevance_score, is_relevant)
            
            classified_article = {
                **article,
                'is_relevant': is_relevant,
                'relevance_score': float(relevance_score),
                'reasoning': reasoning
            }
            
            classified_articles.append(classified_article)
        
        # Sort by relevance score (highest first)
        classified_articles.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return classified_articles
    
    def _generate_reasoning(self, article: Dict[str, Any], company_name: str, objectives: str, relevance_score: float, is_relevant: bool) -> str:
        """Generate human-readable reasoning for classification."""
        reasoning_parts = []
        
        # Check company name mentions
        text = f"{article['title']} {article['content']}".lower()
        company_name_lower = company_name.lower()
        
        if company_name_lower in text:
            reasoning_parts.append(f"Mentions company '{company_name}'")
        
        # Check objective keywords
        objective_keywords = self._extract_keywords(objectives)
        found_keywords = [keyword for keyword in objective_keywords if keyword in text]
        
        if found_keywords:
            reasoning_parts.append(f"Contains relevant keywords: {', '.join(found_keywords[:3])}")
        
        # Add score-based reasoning
        if relevance_score > 0.7:
            reasoning_parts.append("High relevance score")
        elif relevance_score > 0.4:
            reasoning_parts.append("Medium relevance score")
        else:
            reasoning_parts.append("Low relevance score")
        
        if not reasoning_parts:
            reasoning_parts.append("No clear relevance indicators found")
        
        return "; ".join(reasoning_parts)
    
    def _generate_filtered_csv(self, classified_articles: List[Dict[str, Any]], company_name: str) -> str:
        """Generate filtered CSV with only relevant articles."""
        # Filter relevant articles
        relevant_articles = [article for article in classified_articles if article['is_relevant']]
        
        # Create DataFrame
        df_data = []
        for article in relevant_articles:
            df_data.append({
                'title': article['title'],
                'url': article['url'],
                'source': article['source'],
                'content': article['content'],
                'published_date': article['published_date'],
                'created_at': article['created_at'],
                'relevance_score': article['relevance_score'],
                'reasoning': article['reasoning'],
                'original_csv': article['csv_file']
            })
        
        df = pd.DataFrame(df_data)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{company_name.lower().replace(' ', '_')}_relevant_articles_{timestamp}.csv"
        filepath = self.exports_dir / filename
        
        # Save CSV
        df.to_csv(filepath, index=False)
        
        logger.info(f"Generated filtered CSV with {len(relevant_articles)} relevant articles: {filepath}")
        
        return str(filepath)
