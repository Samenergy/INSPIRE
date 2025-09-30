"""Transformer-based service for classifying articles based on company objectives."""

import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from datetime import datetime
from pathlib import Path
import re
try:
    from sentence_transformers import SentenceTransformer, util
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Warning: Transformers not available, falling back to traditional ML")
from loguru import logger

from app.models import ArticleClassificationRequest, ArticleClassificationResult, ArticleClassificationResponse


class TransformerClassificationService:
    """Transformer-based service for classifying articles based on company objectives."""
    
    def __init__(self):
        self.exports_dir = Path("exports")
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        
        # Initialize transformer models
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize transformer models for classification."""
        if not TRANSFORMERS_AVAILABLE:
            logger.warning("Transformers not available, using fallback approach")
            return
            
        try:
            logger.info("Initializing transformer models...")
            
            # Initialize sentence transformer for semantic similarity
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            logger.info("Transformer models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing transformer models: {str(e)}")
            logger.warning("Falling back to traditional ML approach")
            self.sentence_model = None
    
    def classify_articles(self, request: ArticleClassificationRequest) -> ArticleClassificationResponse:
        """
        Classify articles using transformer-based approach.
        
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
            
            # Classify articles using available approach
            if hasattr(self, 'sentence_model') and self.sentence_model is not None:
                classified_articles = self._classify_with_transformers(
                    all_articles, request.company_name, request.company_objectives
                )
            else:
                # Fallback to traditional ML approach
                classified_articles = self._classify_with_traditional_ml(
                    all_articles, request.company_name, request.company_objectives
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
                message=f"Successfully classified {total_articles} articles using transformers. {relevant_articles} relevant articles found.",
                data=result
            )
            
        except Exception as e:
            logger.error(f"Error in transformer-based article classification: {str(e)}")
            return ArticleClassificationResponse(
                success=False,
                message=f"Transformer classification failed: {str(e)}",
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
    
    def _classify_with_transformers(self, articles: List[Dict[str, Any]], company_name: str, objectives: str) -> List[Dict[str, Any]]:
        """Classify articles using transformer-based semantic similarity."""
        
        # Create reference text for semantic comparison
        reference_text = f"{company_name} {objectives}".lower()
        
        # Encode reference text
        reference_embedding = self.sentence_model.encode(reference_text)
        
        classified_articles = []
        
        for article in articles:
            # Combine title and content for analysis
            article_text = f"{article['title']} {article['content']}".lower()
            
            # Calculate semantic similarity using sentence transformers
            article_embedding = self.sentence_model.encode(article_text)
            
            # Calculate cosine similarity
            similarity_score = util.cos_sim(reference_embedding, article_embedding).item()
            
            # Additional keyword-based scoring
            keyword_score = self._calculate_keyword_relevance(article_text, company_name, objectives)
            
            # Combine semantic similarity and keyword matching
            combined_score = (similarity_score * 0.7) + (keyword_score * 0.3)
            
            # Determine if article is relevant (threshold can be adjusted)
            is_relevant = combined_score > 0.3
            
            # Generate reasoning
            reasoning = self._generate_transformer_reasoning(
                article, company_name, objectives, similarity_score, keyword_score, combined_score, is_relevant
            )
            
            classified_article = {
                **article,
                'is_relevant': is_relevant,
                'relevance_score': float(combined_score),
                'semantic_similarity': float(similarity_score),
                'keyword_score': float(keyword_score),
                'reasoning': reasoning
            }
            
            classified_articles.append(classified_article)
        
        # Sort by relevance score (highest first)
        classified_articles.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return classified_articles
    
    def _classify_with_traditional_ml(self, articles: List[Dict[str, Any]], company_name: str, objectives: str) -> List[Dict[str, Any]]:
        """Fallback traditional ML classification when transformers are not available."""
        
        # Create reference text for keyword matching
        company_keywords = self._extract_keywords(company_name)
        objective_keywords = self._extract_keywords(objectives)
        
        classified_articles = []
        
        for article in articles:
            # Combine title and content for analysis
            text = f"{article['title']} {article['content']}".lower()
            
            # Calculate keyword-based relevance
            relevance_score = self._calculate_keyword_relevance(text, company_name, objectives)
            
            # Determine if article is relevant (threshold can be adjusted)
            is_relevant = relevance_score > 0.3
            
            # Generate reasoning
            reasoning = self._generate_traditional_reasoning(
                article, company_name, objectives, relevance_score, is_relevant
            )
            
            classified_article = {
                **article,
                'is_relevant': is_relevant,
                'relevance_score': float(relevance_score),
                'semantic_similarity': 0.0,  # Not available in fallback
                'keyword_score': float(relevance_score),
                'reasoning': reasoning
            }
            
            classified_articles.append(classified_article)
        
        # Sort by relevance score (highest first)
        classified_articles.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return classified_articles
    
    def _calculate_keyword_relevance(self, text: str, company_name: str, objectives: str) -> float:
        """Calculate keyword-based relevance score."""
        score = 0.0
        
        # Company name relevance (higher weight)
        company_name_lower = company_name.lower()
        if company_name_lower in text:
            score += 0.6
        
        # Extract and match objective keywords
        objective_keywords = self._extract_keywords(objectives)
        text_keywords = self._extract_keywords(text)
        
        # Calculate keyword overlap
        common_keywords = set(objective_keywords) & set(text_keywords)
        if objective_keywords:
            keyword_score = len(common_keywords) / len(objective_keywords)
            score += keyword_score * 0.4
        
        return min(score, 1.0)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text."""
        # Remove special characters and split into words
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Filter out common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
            'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
        }
        
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        return keywords
    
    def _generate_transformer_reasoning(self, article: Dict[str, Any], company_name: str, objectives: str, 
                                      semantic_score: float, keyword_score: float, combined_score: float, is_relevant: bool) -> str:
        """Generate human-readable reasoning for transformer-based classification."""
        reasoning_parts = []
        
        # Semantic similarity reasoning
        if semantic_score > 0.7:
            reasoning_parts.append("High semantic similarity to company objectives")
        elif semantic_score > 0.4:
            reasoning_parts.append("Medium semantic similarity to company objectives")
        else:
            reasoning_parts.append("Low semantic similarity to company objectives")
        
        # Keyword matching reasoning
        text = f"{article['title']} {article['content']}".lower()
        company_name_lower = company_name.lower()
        
        if company_name_lower in text:
            reasoning_parts.append(f"Mentions company '{company_name}'")
        
        # Check objective keywords
        objective_keywords = self._extract_keywords(objectives)
        found_keywords = [keyword for keyword in objective_keywords if keyword in text]
        
        if found_keywords:
            reasoning_parts.append(f"Contains relevant keywords: {', '.join(found_keywords[:3])}")
        
        # Combined score reasoning
        if combined_score > 0.6:
            reasoning_parts.append("High combined relevance score")
        elif combined_score > 0.3:
            reasoning_parts.append("Medium combined relevance score")
        else:
            reasoning_parts.append("Low combined relevance score")
        
        # Add technical details
        reasoning_parts.append(f"Semantic similarity: {semantic_score:.3f}, Keyword score: {keyword_score:.3f}")
        
        if not reasoning_parts:
            reasoning_parts.append("No clear relevance indicators found")
        
        return "; ".join(reasoning_parts)
    
    def _generate_traditional_reasoning(self, article: Dict[str, Any], company_name: str, objectives: str, 
                                      relevance_score: float, is_relevant: bool) -> str:
        """Generate human-readable reasoning for traditional ML classification."""
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
        
        # Add method indicator
        reasoning_parts.append("Traditional ML classification")
        
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
                'semantic_similarity': article['semantic_similarity'],
                'keyword_score': article['keyword_score'],
                'reasoning': article['reasoning'],
                'original_csv': article['csv_file']
            })
        
        df = pd.DataFrame(df_data)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{company_name.lower().replace(' ', '_')}_transformer_relevant_articles_{timestamp}.csv"
        filepath = self.exports_dir / filename
        
        # Save CSV
        df.to_csv(filepath, index=False)
        
        logger.info(f"Generated transformer-filtered CSV with {len(relevant_articles)} relevant articles: {filepath}")
        
        return str(filepath)
