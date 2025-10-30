
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from collections import Counter, defaultdict
from sentence_transformers import SentenceTransformer, util
import re

class CompanyProfileAggregator:

    def __init__(self, intelligence_service=None):
        self.intelligence_service = intelligence_service
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

        self.similarity_threshold = 0.75
        self.min_mentions = 1

        print("Company Profile Aggregator initialized")

    def _extract_from_articles(self, articles: List[Dict[str, str]], company_name: str = "") -> Dict[str, List]:
        all_descriptions = []
        all_strengths = []
        all_weaknesses = []
        all_opportunities = []

        for article in articles:
            title = article.get('title', '')
            content = article.get('content', '')

            if not content:
                continue

            intelligence = self.intelligence_service.extract_intelligence(content, title, company_name)

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
        if not items:
            return []

        texts = [item['text'] for item in items]
        embeddings = self.sentence_model.encode(texts, normalize_embeddings=True)

        similarity_matrix = util.cos_sim(embeddings, embeddings).cpu().numpy()

        clusters = []
        used = set()

        for i in range(len(items)):
            if i in used:
                continue

            cluster = [items[i]]
            used.add(i)

            for j in range(i + 1, len(items)):
                if j in used:
                    continue

                if similarity_matrix[i][j] >= self.similarity_threshold:
                    cluster.append(items[j])
                    used.add(j)

            clusters.append(cluster)

        return clusters

    def _merge_cluster(self, cluster: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not cluster:
            return None

        best_item = max(cluster, key=lambda x: x['score'])

        avg_score = np.mean([item['score'] for item in cluster])

        confidences = [item['confidence'] for item in cluster]
        confidence_counts = Counter(confidences)
        most_common_confidence = confidence_counts.most_common(1)[0][0]

        return {
            'text': best_item['text'],
            'score': float(avg_score),
            'confidence': most_common_confidence,
            'mentions': len(cluster),
            'variations': [item['text'] for item in cluster if item['text'] != best_item['text']]
        }

    def _deduplicate_and_merge(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not items:
            return []

        clusters = self._cluster_similar_items(items)

        merged_items = []
        for cluster in clusters:
            merged = self._merge_cluster(cluster)
            if merged:
                merged_items.append(merged)

        return merged_items

    def _rank_by_importance(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not items:
            return []

        confidence_weights = {
            'high': 1.0,
            'medium': 0.8,
            'low': 0.5
        }

        for item in items:
            confidence_weight = confidence_weights.get(item['confidence'], 0.5)
            frequency_weight = min(item['mentions'] / 3.0, 1.5)

            item['importance_score'] = (
                item['score'] * 0.4 +
                confidence_weight * 0.3 +
                frequency_weight * 0.3
            )

        items.sort(key=lambda x: x['importance_score'], reverse=True)

        return items

    def _synthesize_description(self, descriptions: List[Dict[str, Any]]) -> str:
        if not descriptions:
            return "No description available."

        if len(descriptions) == 1:
            return descriptions[0]['text']

        descriptions_sorted = sorted(descriptions, key=lambda x: x['score'], reverse=True)
        base_description = descriptions_sorted[0]['text']

        return base_description

    def _format_strength_text(self, item: Dict[str, Any]) -> str:
        text = item['text']

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

        if title:
            return f"{title}: {text}"
        else:
            return text

    def _format_profile_section(self, items: List[Dict[str, Any]], section_type: str) -> List[str]:
        formatted = []

        for item in items:
            text = item['text']

            if section_type == 'strengths':
                text = self._format_strength_text(item)

            formatted.append(text)

        return formatted

    def aggregate_profile(self, articles: List[Dict[str, str]],
                         company_name: str = "") -> Dict[str, Any]:
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

        extracted = self._extract_from_articles(articles, company_name)

        description = self._synthesize_description(extracted['descriptions'])

        unique_strengths = self._deduplicate_and_merge(extracted['strengths'])
        unique_weaknesses = self._deduplicate_and_merge(extracted['weaknesses'])
        unique_opportunities = self._deduplicate_and_merge(extracted['opportunities'])

        ranked_strengths = self._rank_by_importance(unique_strengths)
        ranked_weaknesses = self._rank_by_importance(unique_weaknesses)
        ranked_opportunities = self._rank_by_importance(unique_opportunities)

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
        lines = []

        if profile['company_name']:
            lines.append(f"# {profile['company_name']}")
            lines.append("")

        lines.append(profile['description'])
        lines.append("")
        lines.append(f"(Based on analysis of {profile['articles_analyzed']} articles)")
        lines.append("")

        if profile['strengths']:
            lines.append("## Strengths")
            lines.append("")
            for i, strength in enumerate(profile['strengths'], 1):
                lines.append(f"{i}. {strength}")
            lines.append("")

        if profile['weaknesses']:
            lines.append("## Weaknesses")
            lines.append("")
            for i, weakness in enumerate(profile['weaknesses'], 1):
                lines.append(f"{i}. {weakness}")
            lines.append("")

        if profile['opportunities']:
            lines.append("## Opportunities")
            lines.append("")
            for i, opportunity in enumerate(profile['opportunities'], 1):
                lines.append(f"{i}. {opportunity}")
            lines.append("")

        return "\n".join(lines)

