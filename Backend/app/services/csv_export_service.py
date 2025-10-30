
import csv
import os
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path

from app.models import NewsArticle, WebsiteUpdate, BusinessRegistry
from loguru import logger

class CSVExportService:

    def __init__(self, export_dir: str = "exports"):
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(exist_ok=True)
        logger.info(f"CSV export directory: {self.export_dir.absolute()}")

    def export_news_articles(self, articles: List[NewsArticle], company_name: str) -> str:
        if not articles:
            logger.warning(f"No news articles to export for {company_name}")
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{company_name.replace(' ', '_').lower()}_news_articles_{timestamp}.csv"
        filepath = self.export_dir / filename

        try:
            with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'id', 'company_id', 'title', 'url', 'source', 'content',
                    'published_date', 'created_at'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                writer.writeheader()

                for article in articles:
                    writer.writerow({
                        'id': article.id,
                        'company_id': article.company_id,
                        'title': article.title,
                        'url': article.url,
                        'source': article.source,
                        'content': article.content or '',
                        'published_date': article.published_date.isoformat() if article.published_date else '',
                        'created_at': article.created_at.isoformat()
                    })

            logger.info(f"Exported {len(articles)} news articles to {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Failed to export news articles: {e}")
            raise

    def export_website_updates(self, updates: List[WebsiteUpdate], company_name: str) -> str:
        if not updates:
            logger.warning(f"No website updates to export for {company_name}")
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{company_name.replace(' ', '_').lower()}_website_updates_{timestamp}.csv"
        filepath = self.export_dir / filename

        try:
            with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'id', 'company_id', 'url', 'title', 'content', 'change_type',
                    'detected_at'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                writer.writeheader()

                for update in updates:
                    writer.writerow({
                        'id': update.id,
                        'company_id': update.company_id,
                        'url': update.url,
                        'title': update.title or '',
                        'content': update.content or '',
                        'change_type': update.change_type or '',
                        'detected_at': update.detected_at.isoformat() if update.detected_at else ''
                    })

            logger.info(f"Exported {len(updates)} website updates to {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Failed to export website updates: {e}")
            raise

    def export_business_registry(self, registry_entries: List[BusinessRegistry], company_name: str) -> str:
        if not registry_entries:
            logger.warning(f"No business registry entries to export for {company_name}")
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{company_name.replace(' ', '_').lower()}_business_registry_{timestamp}.csv"
        filepath = self.export_dir / filename

        try:
            with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'id', 'company_id', 'registration_number', 'registration_date',
                    'legal_status', 'business_type', 'registered_address', 'officers_count'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                writer.writeheader()

                for entry in registry_entries:
                    writer.writerow({
                        'id': entry.id,
                        'company_id': entry.company_id,
                        'registration_number': entry.registration_number or '',
                        'registration_date': entry.registration_date.isoformat() if entry.registration_date else '',
                        'legal_status': entry.legal_status or '',
                        'business_type': entry.business_type or '',
                        'registered_address': entry.registered_address or '',
                        'officers_count': len(entry.officers) if entry.officers else 0
                    })

            logger.info(f"Exported {len(registry_entries)} business registry entries to {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Failed to export business registry entries: {e}")
            raise

    def export_comprehensive_data(self,
                                company_name: str,
                                news_articles: List[NewsArticle] = None,
                                website_updates: List[WebsiteUpdate] = None,
                                business_registry: List[BusinessRegistry] = None) -> Dict[str, str]:
        exported_files = {}

        try:
            if news_articles:
                news_file = self.export_news_articles(news_articles, company_name)
                if news_file:
                    exported_files['news_articles'] = news_file

            if website_updates:
                website_file = self.export_website_updates(website_updates, company_name)
                if website_file:
                    exported_files['website_updates'] = website_file

            if business_registry:
                registry_file = self.export_business_registry(business_registry, company_name)
                if registry_file:
                    exported_files['business_registry'] = registry_file

            logger.info(f"Exported comprehensive data for {company_name}: {list(exported_files.keys())}")
            return exported_files

        except Exception as e:
            logger.error(f"Failed to export comprehensive data for {company_name}: {e}")
            raise

    def get_export_summary(self, company_name: str) -> Dict[str, Any]:
        company_files = []

        try:
            pattern = f"{company_name.replace(' ', '_').lower()}_*"
            for file_path in self.export_dir.glob(pattern):
                if file_path.is_file():
                    stat = file_path.stat()
                    company_files.append({
                        'filename': file_path.name,
                        'filepath': str(file_path),
                        'size_bytes': stat.st_size,
                        'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        'modified_at': datetime.fromtimestamp(stat.st_mtime).isoformat()
                    })

            return {
                'company_name': company_name,
                'export_directory': str(self.export_dir.absolute()),
                'total_files': len(company_files),
                'files': company_files
            }

        except Exception as e:
            logger.error(f"Failed to get export summary for {company_name}: {e}")
            return {
                'company_name': company_name,
                'export_directory': str(self.export_dir.absolute()),
                'total_files': 0,
                'files': [],
                'error': str(e)
            }
