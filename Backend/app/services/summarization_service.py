
import pandas as pd
from typing import List, Dict, Any, Optional
from pathlib import Path
import sys
from loguru import logger

sys.path.append(str(Path(__file__).parent.parent))

from app.services.enhanced_summarization_model import EnhancedSummarizationModel

class SummarizationService:

    def __init__(self, model_dir: str = "ml_models/summarization"):
        self.model_dir = model_dir
        self.model = EnhancedSummarizationModel(model_dir=model_dir)
        self.is_loaded = True

        logger.info("Enhanced summarization service initialized")

    def load_model(self) -> bool:
        self.is_loaded = True
        logger.info("Summarization model ready")
        return True

    def summarize_article(self, content: str, title: str = "", max_sentences: int = None,
                         domain: str = 'general') -> str:
        if not content or pd.isna(content):
            return ""

        try:
            summary = self.model.summarize(
                text=str(content),
                title=str(title) if title else "",
                max_sentences=max_sentences,
                domain=domain
            )
            return summary
        except Exception as e:
            logger.error(f"Error summarizing article: {e}")
            return ""

    def summarize_articles(self, articles: List[Dict[str, Any]],
                          max_sentences: int = None,
                          domain: str = 'general') -> List[Dict[str, Any]]:
        if not articles:
            return []

        summarized_articles = []

        for article in articles:
            try:
                content = article.get('content', '')
                title = article.get('title', '')

                summary = self.summarize_article(content, title, max_sentences, domain)

                summarized_article = article.copy()
                summarized_article['summary'] = summary

                if summary:
                    summarized_article['summary_length'] = len(summary.split())
                    summarized_article['original_length'] = len(str(content).split())
                    summarized_article['compression_ratio'] = (
                        len(summary.split()) / max(len(str(content).split()), 1)
                    )
                else:
                    summarized_article['summary_length'] = 0
                    summarized_article['original_length'] = len(str(content).split())
                    summarized_article['compression_ratio'] = 0

                summarized_articles.append(summarized_article)

            except Exception as e:
                logger.error(f"Error processing article: {e}")
                summarized_article = article.copy()
                summarized_article['summary'] = ""
                summarized_article['summary_length'] = 0
                summarized_article['original_length'] = len(str(article.get('content', '')).split())
                summarized_article['compression_ratio'] = 0
                summarized_articles.append(summarized_article)

        return summarized_articles

    def summarize_dataframe(self, df: pd.DataFrame,
                           content_col: str = 'content',
                           title_col: str = 'title',
                           max_sentences: int = None,
                           domain: str = 'general') -> pd.DataFrame:
        if df.empty:
            return df

        articles = df.to_dict('records')

        summarized_articles = self.summarize_articles(articles, max_sentences, domain)

        summarized_df = pd.DataFrame(summarized_articles)

        return summarized_df

    def summarize_relevant_articles(self, classification_results: Dict[str, Any],
                                   max_sentences: int = None,
                                   domain: str = 'general') -> Dict[str, Any]:
        if not classification_results or 'results' not in classification_results:
            return classification_results

        results = classification_results['results']

        relevant_articles = []
        for article in results:
            prediction_label = article.get('prediction_label', '')
            if prediction_label in ['Directly Relevant', 'Indirectly Useful']:
                relevant_articles.append(article)

        if not relevant_articles:
            logger.info("No relevant articles found for summarization")
            return classification_results

        logger.info(f"Summarizing {len(relevant_articles)} relevant articles")

        summarized_articles = self.summarize_articles(relevant_articles, max_sentences, domain)

        updated_results = []
        for article in results:
            summarized_article = next(
                (sa for sa in summarized_articles if sa.get('title') == article.get('title')),
                None
            )

            if summarized_article:
                updated_results.append(summarized_article)
            else:
                updated_results.append(article)

        updated_classification_results = classification_results.copy()
        updated_classification_results['results'] = updated_results

        updated_classification_results['summarization_info'] = {
            'total_articles': len(results),
            'summarized_articles': len(summarized_articles),
            'summarization_ratio': len(summarized_articles) / max(len(results), 1)
        }

        return updated_classification_results

    def get_summary_statistics(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not articles:
            return {}

        total_articles = len(articles)
        articles_with_summaries = sum(1 for a in articles if a.get('summary'))

        if articles_with_summaries == 0:
            return {
                'total_articles': total_articles,
                'articles_with_summaries': 0,
                'summarization_rate': 0,
                'avg_summary_length': 0,
                'avg_compression_ratio': 0
            }

        summary_lengths = [len(a.get('summary', '').split()) for a in articles if a.get('summary')]
        avg_summary_length = sum(summary_lengths) / len(summary_lengths) if summary_lengths else 0

        compression_ratios = [a.get('compression_ratio', 0) for a in articles if a.get('compression_ratio')]
        avg_compression_ratio = sum(compression_ratios) / len(compression_ratios) if compression_ratios else 0

        return {
            'total_articles': total_articles,
            'articles_with_summaries': articles_with_summaries,
            'summarization_rate': articles_with_summaries / total_articles,
            'avg_summary_length': avg_summary_length,
            'avg_compression_ratio': avg_compression_ratio
        }

    def is_model_available(self) -> bool:
        return self.is_loaded
