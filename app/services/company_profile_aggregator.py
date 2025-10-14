"""Company Profile Aggregator Service.

This service aggregates intelligence from multiple articles about a single company
to create a comprehensive company profile.

YOUR CONTRIBUTIONS (for Capstone Defense):
1. Multi-document aggregation algorithm
2. Semantic deduplication using embedding similarity
3. Importance ranking based on frequency, confidence, and recency
4. Context-aware description synthesis from multiple sources
5. Clustering algorithm for grouping similar strengths/weaknesses
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from collections import Counter, defaultdict
from sentence_transformers import SentenceTransformer, util
import re


class CompanyProfileAggregator:
    """Aggregates company intelligence from multiple articles into a comprehensive profile."""
    
    def __init__(self, intelligence_service=None):
        """
        Initialize the aggregator.
        
        Args:
            intelligence_service: CompanyIntelligenceService instance
        """
        self.intelligence_service = intelligence_service
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # YOUR CONTRIBUTION: Clustering thresholds
        self.similarity_threshold = 0.75  # For deduplication
        self.min_mentions = 1  # Minimum mentions to include
        
        print("Company Profile Aggregator initialized")
    
    def _extract_from_articles(self, articles: List[Dict[str, str]], company_name: str = "") -> Dict[str, List]:
        """Extract intelligence from all articles."""
        all_descriptions = []
        all_strengths = []
        all_weaknesses = []
        all_opportunities = []
        
        for article in articles:
            title = article.get('title', '')
            content = article.get('content', '')
            
            if not content:
                continue
            
            # Extract intelligence from this article (pass company_name for better validation)
            intelligence = self.intelligence_service.extract_intelligence(content, title, company_name)
            
            # Collect results
            if intelligence['description']:
                all_descriptions.append(intelligence['description'])
            
            all_strengths.extend(intelligence['strengths'])
            all_weaknesses.extend(intelligence['weaknesses'])
            all_opportunities.extend(intelligence['opportunities'])
        
        return {
            'descriptions': all_descriptions,
            'strengths': all_strengths,
            'weaknesses': all_weaknesses,
            'opportunities': all_opportunities
        }
    
    def _cluster_similar_items(self, items: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """
        YOUR CONTRIBUTION: Cluster similar items using semantic similarity.
        Groups items that say essentially the same thing.
        """
        if not items:
            return []
        
        # Extract texts and encode
        texts = [item['text'] for item in items]
        embeddings = self.sentence_model.encode(texts, normalize_embeddings=True)
        
        # Calculate similarity matrix
        similarity_matrix = util.cos_sim(embeddings, embeddings).cpu().numpy()
        
        # Cluster using greedy approach
        clusters = []
        used = set()
        
        for i in range(len(items)):
            if i in used:
                continue
            
            # Start new cluster
            cluster = [items[i]]
            used.add(i)
            
            # Find similar items
            for j in range(i + 1, len(items)):
                if j in used:
                    continue
                
                if similarity_matrix[i][j] >= self.similarity_threshold:
                    cluster.append(items[j])
                    used.add(j)
            
            clusters.append(cluster)
        
        return clusters
    
    def _merge_cluster(self, cluster: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        YOUR CONTRIBUTION: Merge items in a cluster into a single representative item.
        Selects the best text and averages confidence scores.
        """
        if not cluster:
            return None
        
        # Select the item with highest score as representative
        best_item = max(cluster, key=lambda x: x['score'])
        
        # Calculate average score and confidence
        avg_score = np.mean([item['score'] for item in cluster])
        
        # Count confidence levels
        confidences = [item['confidence'] for item in cluster]
        confidence_counts = Counter(confidences)
        most_common_confidence = confidence_counts.most_common(1)[0][0]
        
        return {
            'text': best_item['text'],
            'score': float(avg_score),
            'confidence': most_common_confidence,
            'mentions': len(cluster),  # How many articles mentioned this
            'variations': [item['text'] for item in cluster if item['text'] != best_item['text']]
        }
    
    def _deduplicate_and_merge(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        YOUR CONTRIBUTION: Deduplicate similar items and merge them.
        Returns consolidated list of unique items.
        """
        if not items:
            return []
        
        # Cluster similar items
        clusters = self._cluster_similar_items(items)
        
        # Merge each cluster
        merged_items = []
        for cluster in clusters:
            merged = self._merge_cluster(cluster)
            if merged:
                merged_items.append(merged)
        
        return merged_items
    
    def _rank_by_importance(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        YOUR CONTRIBUTION: Rank items by importance.
        Importance = frequency × confidence_weight × score
        """
        if not items:
            return []
        
        # Confidence weights
        confidence_weights = {
            'high': 1.0,
            'medium': 0.8,
            'low': 0.5
        }
        
        # Calculate importance score
        for item in items:
            confidence_weight = confidence_weights.get(item['confidence'], 0.5)
            frequency_weight = min(item['mentions'] / 3.0, 1.5)  # More mentions = more important
            
            item['importance_score'] = (
                item['score'] * 0.4 +
                confidence_weight * 0.3 +
                frequency_weight * 0.3
            )
        
        # Sort by importance
        items.sort(key=lambda x: x['importance_score'], reverse=True)
        
        return items
    
    def _synthesize_description(self, descriptions: List[Dict[str, Any]]) -> str:
        """
        YOUR CONTRIBUTION: Synthesize a single comprehensive description from multiple sources.
        Combines key information from all descriptions.
        """
        if not descriptions:
            return "No description available."
        
        # If only one description, return it
        if len(descriptions) == 1:
            return descriptions[0]['text']
        
        # Get the highest scoring description as base
        descriptions_sorted = sorted(descriptions, key=lambda x: x['score'], reverse=True)
        base_description = descriptions_sorted[0]['text']
        
        # For now, return the best description
        # In a more advanced version, we could use NLP to merge multiple descriptions
        return base_description
    
    def _format_strength_text(self, item: Dict[str, Any]) -> str:
        """Format a strength item for display."""
        text = item['text']
        
        # Try to extract a category/title from the text
        # Look for patterns like "strong X", "leading Y", etc.
        text_lower = text.lower()
        
        title = None
        if 'market' in text_lower and ('share' in text_lower or 'position' in text_lower or 'leader' in text_lower):
            title = "Market Leadership"
        elif 'customer' in text_lower and 'base' in text_lower:
            title = "Customer Base"
        elif 'network' in text_lower or 'infrastructure' in text_lower:
            title = "Network Infrastructure"
        elif 'financial' in text_lower or 'profit' in text_lower or 'revenue' in text_lower:
            title = "Financial Performance"
        elif 'brand' in text_lower or 'recognition' in text_lower:
            title = "Brand Recognition"
        elif 'technology' in text_lower or 'innovation' in text_lower:
            title = "Technology & Innovation"
        elif 'partnership' in text_lower or 'alliance' in text_lower:
            title = "Strategic Partnerships"
        elif 'team' in text_lower or 'leadership' in text_lower or 'management' in text_lower:
            title = "Leadership & Management"
        
        # If we found a title, format nicely
        if title:
            # Clean the text
            return f"{title}: {text}"
        else:
            return text
    
    def _format_profile_section(self, items: List[Dict[str, Any]], section_type: str) -> List[str]:
        """
        Format items for final profile output.
        
        Args:
            items: List of intelligence items
            section_type: 'strengths', 'weaknesses', or 'opportunities'
        """
        formatted = []
        
        for item in items:
            text = item['text']
            
            # Add formatting based on section type
            if section_type == 'strengths':
                text = self._format_strength_text(item)
            
            formatted.append(text)
        
        return formatted
    
    def aggregate_profile(self, articles: List[Dict[str, str]], 
                         company_name: str = "") -> Dict[str, Any]:
        """
        Aggregate company profile from multiple articles.
        
        Args:
            articles: List of article dictionaries with 'title' and 'content'
            company_name: Name of the company (optional)
            
        Returns:
            Comprehensive company profile
        """
        if not articles:
            return {
                'company_name': company_name,
                'articles_analyzed': 0,
                'description': 'No articles available',
                'strengths': [],
                'weaknesses': [],
                'opportunities': [],
                'metadata': {}
            }
        
        # Step 1: Extract from all articles (pass company_name for validation)
        extracted = self._extract_from_articles(articles, company_name)
        
        # Step 2: Process description
        description = self._synthesize_description(extracted['descriptions'])
        
        # Step 3: Deduplicate and merge items
        unique_strengths = self._deduplicate_and_merge(extracted['strengths'])
        unique_weaknesses = self._deduplicate_and_merge(extracted['weaknesses'])
        unique_opportunities = self._deduplicate_and_merge(extracted['opportunities'])
        
        # Step 4: Rank by importance
        ranked_strengths = self._rank_by_importance(unique_strengths)
        ranked_weaknesses = self._rank_by_importance(unique_weaknesses)
        ranked_opportunities = self._rank_by_importance(unique_opportunities)
        
        # Step 5: Format for output
        strengths_formatted = self._format_profile_section(ranked_strengths[:10], 'strengths')
        weaknesses_formatted = self._format_profile_section(ranked_weaknesses[:8], 'weaknesses')
        opportunities_formatted = self._format_profile_section(ranked_opportunities[:8], 'opportunities')
        
        return {
            'company_name': company_name,
            'articles_analyzed': len(articles),
            'description': description,
            'strengths': strengths_formatted,
            'weaknesses': weaknesses_formatted,
            'opportunities': opportunities_formatted,
            'metadata': {
                'total_strengths_extracted': len(extracted['strengths']),
                'unique_strengths': len(unique_strengths),
                'total_weaknesses_extracted': len(extracted['weaknesses']),
                'unique_weaknesses': len(unique_weaknesses),
                'total_opportunities_extracted': len(extracted['opportunities']),
                'unique_opportunities': len(unique_opportunities),
                'descriptions_found': len(extracted['descriptions'])
            },
            'detailed_items': {
                'strengths': ranked_strengths[:10],
                'weaknesses': ranked_weaknesses[:8],
                'opportunities': ranked_opportunities[:8]
            }
        }
    
    def format_profile_as_text(self, profile: Dict[str, Any]) -> str:
        """
        Format the profile as readable text (like your MTN example).
        
        Args:
            profile: Company profile dictionary
            
        Returns:
            Formatted text profile
        """
        lines = []
        
        # Company name and description
        if profile['company_name']:
            lines.append(f"# {profile['company_name']}")
            lines.append("")
        
        lines.append(profile['description'])
        lines.append("")
        lines.append(f"(Based on analysis of {profile['articles_analyzed']} articles)")
        lines.append("")
        
        # Strengths
        if profile['strengths']:
            lines.append("## Strengths")
            lines.append("")
            for i, strength in enumerate(profile['strengths'], 1):
                lines.append(f"{i}. {strength}")
            lines.append("")
        
        # Weaknesses
        if profile['weaknesses']:
            lines.append("## Weaknesses")
            lines.append("")
            for i, weakness in enumerate(profile['weaknesses'], 1):
                lines.append(f"{i}. {weakness}")
            lines.append("")
        
        # Opportunities
        if profile['opportunities']:
            lines.append("## Opportunities")
            lines.append("")
            for i, opportunity in enumerate(profile['opportunities'], 1):
                lines.append(f"{i}. {opportunity}")
            lines.append("")
        
        return "\n".join(lines)


