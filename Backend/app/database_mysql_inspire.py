"""
MySQL Database Connection for INSPIRE Project
Handles connections to the inspire database with proper error handling and connection pooling
"""

import logging
import json
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
import pymysql
import pymysql.cursors
from pymysql.constants import CLIENT
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MySQLInspireConnection:
    """MySQL connection manager for INSPIRE database"""
    
    def __init__(self):
        self.connection_pool = []
        self.max_connections = 10
        self.current_connections = 0
        
    def get_connection_config(self) -> Dict[str, Any]:
        """Get database connection configuration"""
        config = {
            'host': settings.db_host,
            'port': settings.db_port,
            'user': settings.db_user,
            'password': settings.db_password,
            'database': settings.db_name,
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor,
            'client_flag': CLIENT.MULTI_STATEMENTS,
            'autocommit': True,
            'connect_timeout': 30,
            'read_timeout': 30,
            'write_timeout': 30
        }
        
        # max_allowed_packet is set after connection in get_connection()
        # since pymysql doesn't support init_command directly
        
        return config
    
    @asynccontextmanager
    async def get_connection(self):
        """Get a database connection from the pool"""
        connection = None
        try:
            # Try to get connection from pool first
            if self.connection_pool:
                connection = self.connection_pool.pop()
                if not self._is_connection_alive(connection):
                    connection = None
            
            # Create new connection if pool is empty or connection is dead
            if not connection:
                config = self.get_connection_config()
                # Remove init_command as pymysql doesn't support it directly
                config.pop('init_command', None)
                try:
                    connection = pymysql.connect(**config)
                    # max_allowed_packet is set at server level in docker-compose.yml
                    # No need to set it per session (and it's read-only anyway)
                    self.current_connections += 1
                    logger.info(f"Created new MySQL connection. Total connections: {self.current_connections}")
                except Exception as e:
                    error_str = str(e)
                    if "max_allowed_packet" in error_str.lower() or "1153" in error_str:
                        logger.error(f"MySQL connection failed due to packet size: {error_str}")
                        logger.error("This suggests data is too large even before query execution.")
                        logger.error("Ensure MySQL server has max_allowed_packet set to at least 64MB in docker-compose.yml")
                    raise
            
            yield connection
            
        except Exception as e:
            logger.error(f"Error getting MySQL connection: {str(e)}")
            if connection:
                connection.close()
                self.current_connections -= 1
            raise
        finally:
            # Return connection to pool if it's still alive and pool isn't full
            if connection and self._is_connection_alive(connection):
                if len(self.connection_pool) < self.max_connections:
                    self.connection_pool.append(connection)
                else:
                    connection.close()
                    self.current_connections -= 1
            elif connection:
                connection.close()
                self.current_connections -= 1
    
    def _is_connection_alive(self, connection) -> bool:
        """Check if connection is still alive"""
        try:
            connection.ping(reconnect=False)
            return True
        except:
            return False
    
    async def test_connection(self) -> bool:
        """Test database connection"""
        try:
            async with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                    return result is not None
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return False
    
    async def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        try:
            async with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query, params)
                    return cursor.fetchall()
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            raise
    
    async def execute_insert(self, query: str, params: Optional[tuple] = None) -> int:
        """Execute an INSERT query and return the last insert ID"""
        try:
            async with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query, params)
                    return cursor.lastrowid
        except Exception as e:
            error_str = str(e)
            # Check for packet size error
            if "max_allowed_packet" in error_str.lower() or "1153" in error_str:
                logger.error(f"Packet size error: {error_str}")
                logger.warning("Data too large for MySQL packet. Consider reducing data size or increasing max_allowed_packet.")
            logger.error(f"Error executing insert: {error_str}")
            raise
    
    async def execute_update(self, query: str, params: Optional[tuple] = None) -> int:
        """Execute an UPDATE/DELETE query and return affected rows"""
        try:
            async with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query, params)
                    return cursor.rowcount
        except Exception as e:
            error_str = str(e)
            # Check for packet size error
            if "max_allowed_packet" in error_str.lower() or "1153" in error_str:
                logger.error(f"Packet size error: {error_str}")
                logger.warning("Data too large for MySQL packet. Consider reducing data size or increasing max_allowed_packet.")
            logger.error(f"Error executing update: {error_str}")
            raise
    
    async def execute_many(self, query: str, params_list: List[tuple]) -> int:
        """Execute a query with multiple parameter sets"""
        try:
            async with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.executemany(query, params_list)
                    return cursor.rowcount
        except Exception as e:
            logger.error(f"Error executing batch query: {str(e)}")
            raise
    
    async def fetch_one(self, query: str, params: Optional[tuple] = None) -> Optional[Dict[str, Any]]:
        """Fetch a single row from the database"""
        try:
            async with self.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    cursor.execute(query, params)
                    result = cursor.fetchone()
                    return result
        except Exception as e:
            logger.error(f"Error fetching one row: {str(e)}")
            raise
    
    async def fetch_all(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Fetch all rows from the database"""
        try:
            async with self.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    cursor.execute(query, params)
                    results = cursor.fetchall()
                    return results
        except Exception as e:
            logger.error(f"Error fetching all rows: {str(e)}")
            raise
    
    def close_all_connections(self):
        """Close all connections in the pool"""
        for connection in self.connection_pool:
            try:
                connection.close()
            except:
                pass
        self.connection_pool.clear()
        self.current_connections = 0
        logger.info("All MySQL connections closed")

# Global connection instance
mysql_inspire = MySQLInspireConnection()

# Database service functions
class InspireDatabaseService:
    """Service class for INSPIRE database operations"""
    
    def __init__(self):
        self.db = mysql_inspire
    
    # SME Operations
    async def create_sme(self, name: str, sector: str, objective: str, contact_email: str) -> int:
        """Create a new SME record"""
        query = """
        INSERT INTO sme (name, sector, objective, contact_email)
        VALUES (%s, %s, %s, %s)
        """
        return await self.db.execute_insert(query, (name, sector, objective, contact_email))
    
    async def create_sme_with_password(self, name: str, sector: str, objective: str, contact_email: str, password_hash: str) -> int:
        """Create a new SME record with password"""
        query = """
        INSERT INTO sme (name, sector, objective, contact_email, password_hash)
        VALUES (%s, %s, %s, %s, %s)
        """
        return await self.db.execute_insert(query, (name, sector, objective, contact_email, password_hash))
    
    async def get_sme(self, sme_id: int) -> Optional[Dict[str, Any]]:
        """Get SME by ID"""
        query = "SELECT * FROM sme WHERE sme_id = %s"
        results = await self.db.execute_query(query, (sme_id,))
        return results[0] if results else None
    
    async def get_sme_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get SME by email"""
        query = "SELECT * FROM sme WHERE contact_email = %s"
        results = await self.db.execute_query(query, (email,))
        return results[0] if results else None
    
    async def get_all_smes(self) -> List[Dict[str, Any]]:
        """Get all SMEs"""
        query = "SELECT * FROM sme ORDER BY created_at DESC"
        return await self.db.execute_query(query)
    
    async def update_sme(self, sme_id: int, sector: str = None, objective: str = None) -> bool:
        """Update SME sector and objective"""
        try:
            # Build dynamic query based on provided fields
            updates = []
            params = []
            
            if sector is not None:
                updates.append("sector = %s")
                params.append(sector)
            
            if objective is not None:
                updates.append("objective = %s")
                params.append(objective)
            
            if not updates:
                return False
            
            # Add sme_id to params
            params.append(sme_id)
            
            query = f"UPDATE sme SET {', '.join(updates)} WHERE sme_id = %s"
            
            affected_rows = await self.db.execute_update(query, tuple(params))
            return affected_rows > 0
            
        except Exception as e:
            logger.error(f"Error updating SME: {str(e)}")
            raise
    
    # Company Operations
    async def create_company(self, name: str, location: str = None, description: str = None, 
                           industry: str = None, website: str = None, sme_id: int = None) -> int:
        """Create a new company record"""
        query = """
        INSERT INTO company (name, location, description, industry, website, sme_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        return await self.db.execute_insert(query, (name, location, description, industry, website, sme_id))
    
    async def get_company(self, company_id: int) -> Optional[Dict[str, Any]]:
        """Get company by ID"""
        query = "SELECT * FROM company WHERE company_id = %s"
        results = await self.db.execute_query(query, (company_id,))
        return results[0] if results else None
    
    async def get_company_by_name(self, name: str, sme_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get company by name, optionally filtered by sme_id"""
        if sme_id:
            query = "SELECT * FROM company WHERE name = %s AND sme_id = %s LIMIT 1"
            results = await self.db.execute_query(query, (name, sme_id))
        else:
            query = "SELECT * FROM company WHERE name = %s LIMIT 1"
            results = await self.db.execute_query(query, (name,))
        return results[0] if results else None
    
    async def get_all_companies(self, sme_id: int = None) -> List[Dict[str, Any]]:
        """Get all companies, optionally filtered by sme_id"""
        if sme_id:
            query = "SELECT * FROM company WHERE sme_id = %s ORDER BY created_at DESC"
            return await self.db.execute_query(query, (sme_id,))
        else:
            query = "SELECT * FROM company ORDER BY created_at DESC"
            return await self.db.execute_query(query)
    
    async def count_companies_for_sme(self, sme_id: int) -> int:
        """Count companies for a specific SME"""
        query = "SELECT COUNT(*) as count FROM company WHERE sme_id = %s"
        results = await self.db.execute_query(query, (sme_id,))
        return results[0]['count'] if results else 0
    
    async def update_company(self, company_id: int, sme_id: int = None, name: str = None,
                           location: str = None, description: str = None, industry: str = None,
                           website: str = None, company_info: str = None, strengths: str = None,
                           opportunities: str = None) -> bool:
        """Update company information including RAG-extracted intelligence"""
        try:
            updates = []
            params = []
            
            if sme_id is not None:
                updates.append("sme_id = %s")
                params.append(sme_id)
            
            if name is not None:
                updates.append("name = %s")
                params.append(name)
            
            if location is not None:
                updates.append("location = %s")
                params.append(location)
            
            if description is not None:
                updates.append("description = %s")
                params.append(description)
            
            if industry is not None:
                updates.append("industry = %s")
                params.append(industry)
            
            if website is not None:
                updates.append("website = %s")
                params.append(website)
            
            if company_info is not None:
                updates.append("company_info = %s")
                params.append(company_info)
            
            if strengths is not None:
                updates.append("strengths = %s")
                params.append(strengths)
            
            if opportunities is not None:
                updates.append("opportunities = %s")
                params.append(opportunities)
            
            if not updates:
                return False
            
            params.append(company_id)
            
            query = f"UPDATE company SET {', '.join(updates)} WHERE company_id = %s"
            
            affected_rows = await self.db.execute_update(query, tuple(params))
            return affected_rows > 0
            
        except Exception as e:
            logger.error(f"Error updating company: {str(e)}")
            raise
    
    async def delete_company(self, company_id: int) -> bool:
        """Delete company by ID"""
        try:
            query = "DELETE FROM company WHERE company_id = %s"
            affected_rows = await self.db.execute_update(query, (company_id,))
            return affected_rows > 0
        except Exception as e:
            logger.error(f"Error deleting company: {str(e)}")
            raise
    
    # Recommendation Operations
    async def create_recommendation(self, sme_id: int, company_id: int, recommendation_text: str,
                                  confidence_score: float = 0.0, date_generated: str = None) -> int:
        """Create a new recommendation"""
        if not date_generated:
            from datetime import date
            date_generated = date.today().isoformat()
        
        query = """
        INSERT INTO recommendation (sme_id, company_id, recommendation_text, confidence_score, date_generated)
        VALUES (%s, %s, %s, %s, %s)
        """
        return await self.db.execute_insert(query, (sme_id, company_id, recommendation_text, confidence_score, date_generated))
    
    async def get_recommendations_for_sme(self, sme_id: int) -> List[Dict[str, Any]]:
        """Get all recommendations for an SME"""
        query = """
        SELECT r.*, c.name as company_name, c.industry, c.location
        FROM recommendation r
        JOIN company c ON r.company_id = c.company_id
        WHERE r.sme_id = %s
        ORDER BY r.confidence_score DESC, r.date_generated DESC
        """
        return await self.db.execute_query(query, (sme_id,))
    
    async def get_recommendations_for_company(self, company_id: int) -> List[Dict[str, Any]]:
        """Get all recommendations for a company"""
        query = """
        SELECT r.*, s.name as sme_name, s.sector, s.objective
        FROM recommendation r
        JOIN sme s ON r.sme_id = s.sme_id
        WHERE r.company_id = %s
        ORDER BY r.confidence_score DESC, r.date_generated DESC
        """
        return await self.db.execute_query(query, (company_id,))
    
    # Analysis Operations
    async def create_analysis(self, company_id: int, latest_updates: str = None, challenges: str = None,
                            decision_makers: str = None, market_position: str = None, future_plans: str = None,
                            action_plan: str = None, solutions: str = None, analysis_type: str = 'COMPREHENSIVE',
                            confidence_score: float = 0.0, date_analyzed: str = None, status: str = 'COMPLETED') -> int:
        """Create a new analysis record"""
        if not date_analyzed:
            from datetime import date
            date_analyzed = date.today().isoformat()
        
        # Map to database analysis_type enum values
        analysis_type = analysis_type.upper() if analysis_type else 'COMPREHENSIVE'
        if analysis_type not in ['COMPREHENSIVE', 'QUICK', 'DEEP_DIVE']:
            analysis_type = 'COMPREHENSIVE'
        
        query = """
        INSERT INTO analysis (company_id, latest_updates, challenges, decision_makers, market_position,
                            future_plans, action_plan, solutions, analysis_type, date_analyzed, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        return await self.db.execute_insert(query, (company_id, latest_updates, challenges, decision_makers,
                                                   market_position, future_plans, action_plan, solutions,
                                                   analysis_type, date_analyzed, status))
    
    async def get_analysis_for_company(self, company_id: int) -> List[Dict[str, Any]]:
        """Get all analyses for a company"""
        query = """
        SELECT a.*, c.name as company_name
        FROM analysis a
        JOIN company c ON a.company_id = c.company_id
        WHERE a.company_id = %s
        ORDER BY a.date_analyzed DESC
        """
        return await self.db.execute_query(query, (company_id,))
    
    async def get_latest_analysis_for_company(self, company_id: int) -> Optional[Dict[str, Any]]:
        """Get the latest analysis for a company"""
        query = """
        SELECT a.*, c.name as company_name
        FROM analysis a
        JOIN company c ON a.company_id = c.company_id
        WHERE a.company_id = %s
        ORDER BY a.date_analyzed DESC
        LIMIT 1
        """
        results = await self.db.execute_query(query, (company_id,))
        return results[0] if results else None
    
    # Article Operations
    async def create_article(self, company_id: int, title: str, url: str, content: str = None,
                           source: str = None, published_date: str = None, relevance_score: float = 0.0,
                           classification: str = 'Not Relevant', sentiment: str = None) -> int:
        """Create a new article record"""
        query = """
        INSERT INTO article (company_id, title, url, content, source, published_date, relevance_score, classification)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        return await self.db.execute_insert(query, (company_id, title, url, content, source, published_date,
                                                   relevance_score, classification))
    
    async def get_articles_for_company(self, company_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get articles for a company"""
        query = """
        SELECT a.*, c.name as company_name
        FROM article a
        JOIN company c ON a.company_id = c.company_id
        WHERE a.company_id = %s
        ORDER BY a.relevance_score DESC, a.published_date DESC
        LIMIT %s
        """
        return await self.db.execute_query(query, (company_id, limit))
    
    async def get_articles_by_classification(self, classification: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get articles by classification"""
        query = """
        SELECT a.*, c.name as company_name
        FROM article a
        JOIN company c ON a.company_id = c.company_id
        WHERE a.classification = %s
        ORDER BY a.relevance_score DESC, a.published_date DESC
        LIMIT %s
        """
        return await self.db.execute_query(query, (classification, limit))
    
    async def get_articles_for_company_by_classification(self, company_id: int, classification: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get articles for a company by classification"""
        query = """
        SELECT a.*, c.name as company_name
        FROM article a
        JOIN company c ON a.company_id = c.company_id
        WHERE a.company_id = %s AND a.classification = %s
        ORDER BY a.relevance_score DESC, a.published_date DESC
        LIMIT %s
        """
        return await self.db.execute_query(query, (company_id, classification, limit))
    
    async def get_all_articles_by_classification_for_company(self, company_id: int) -> Dict[str, List[Dict[str, Any]]]:
        """Get all articles for a company grouped by classification"""
        directly_relevant = await self.get_articles_for_company_by_classification(company_id, 'Directly Relevant', 100)
        indirectly_useful = await self.get_articles_for_company_by_classification(company_id, 'Indirectly Useful', 100)
        not_relevant = await self.get_articles_for_company_by_classification(company_id, 'Not Relevant', 100)
        
        return {
            'directly_relevant': directly_relevant,
            'indirectly_useful': indirectly_useful,
            'not_relevant': not_relevant
        }
    
    # Dashboard/Summary Operations
    async def get_dashboard_stats(self, sme_id: Optional[int] = None) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics for SME"""
        
        # Base WHERE clause for filtering by SME if provided (using parameterized queries)
        
        stats = {}
        
        try:
            # Basic counts
            if sme_id:
                total_companies_result = await self.db.execute_query(
                    "SELECT COUNT(*) as count FROM company c WHERE c.sme_id = %s", (sme_id,)
                )
                total_articles_result = await self.db.execute_query(
                    "SELECT COUNT(*) as count FROM article a WHERE a.company_id IN (SELECT company_id FROM company WHERE sme_id = %s)", (sme_id,)
                )
                total_analyses_result = await self.db.execute_query(
                    "SELECT COUNT(*) as count FROM analysis an WHERE an.company_id IN (SELECT company_id FROM company WHERE sme_id = %s)", (sme_id,)
                )
                total_campaigns_result = await self.db.execute_query(
                    "SELECT COUNT(*) as count FROM campaign ca WHERE ca.sme_id = %s", (sme_id,)
                )
            else:
                total_companies_result = await self.db.execute_query("SELECT COUNT(*) as count FROM company c")
                total_articles_result = await self.db.execute_query("SELECT COUNT(*) as count FROM article a")
                total_analyses_result = await self.db.execute_query("SELECT COUNT(*) as count FROM analysis an")
                total_campaigns_result = await self.db.execute_query("SELECT COUNT(*) as count FROM campaign ca")
            
            stats['total_companies'] = total_companies_result[0]['count'] if total_companies_result and len(total_companies_result) > 0 else 0
            stats['total_articles'] = total_articles_result[0]['count'] if total_articles_result and len(total_articles_result) > 0 else 0
            stats['total_analyses'] = total_analyses_result[0]['count'] if total_analyses_result and len(total_analyses_result) > 0 else 0
            stats['total_campaigns'] = total_campaigns_result[0]['count'] if total_campaigns_result and len(total_campaigns_result) > 0 else 0
            
            # Companies by status (more accurate using analysis table)
            if sme_id:
                companies_by_status = await self.db.execute_query("""
                    SELECT 
                        CASE 
                            WHEN EXISTS (SELECT 1 FROM analysis WHERE company_id = c.company_id AND status = 'COMPLETED') THEN 'completed'
                            WHEN EXISTS (SELECT 1 FROM analysis WHERE company_id = c.company_id AND status = 'IN_PROGRESS') THEN 'loading'
                            WHEN EXISTS (SELECT 1 FROM analysis WHERE company_id = c.company_id AND status = 'FAILED') THEN 'failed'
                            ELSE 'pending'
                        END as status,
                        COUNT(*) as count
                    FROM company c
                    WHERE c.sme_id = %s
                    GROUP BY status
                """, (sme_id,))
            else:
                companies_by_status = await self.db.execute_query("""
                    SELECT 
                        CASE 
                            WHEN EXISTS (SELECT 1 FROM analysis WHERE company_id = c.company_id AND status = 'COMPLETED') THEN 'completed'
                            WHEN EXISTS (SELECT 1 FROM analysis WHERE company_id = c.company_id AND status = 'IN_PROGRESS') THEN 'loading'
                            WHEN EXISTS (SELECT 1 FROM analysis WHERE company_id = c.company_id AND status = 'FAILED') THEN 'failed'
                            ELSE 'pending'
                        END as status,
                        COUNT(*) as count
                    FROM company c
                    GROUP BY status
                """)
            
            stats['companies_by_status'] = {
                'completed': 0,
                'loading': 0,
                'pending': 0,
                'failed': 0
            }
            for row in companies_by_status:
                status = row['status']
                if status in stats['companies_by_status']:
                    stats['companies_by_status'][status] = row['count']
            
            # Articles by classification
            if sme_id:
                articles_by_classification = await self.db.execute_query("""
                    SELECT 
                        classification,
                        COUNT(*) as count
                    FROM article a
                    WHERE a.company_id IN (SELECT company_id FROM company WHERE sme_id = %s)
                    GROUP BY classification
                """, (sme_id,))
            else:
                articles_by_classification = await self.db.execute_query("""
                    SELECT 
                        classification,
                        COUNT(*) as count
                    FROM article a
                    GROUP BY classification
                """)
            
            stats['articles_by_classification'] = {
                'Directly Relevant': 0,
                'Indirectly Useful': 0,
                'Not Relevant': 0
            }
            for row in articles_by_classification:
                classification = row['classification']
                if classification in stats['articles_by_classification']:
                    stats['articles_by_classification'][classification] = row['count']
            
            # Campaigns by type
            if sme_id:
                campaigns_by_type = await self.db.execute_query("""
                    SELECT 
                        outreach_type,
                        COUNT(*) as count
                    FROM campaign ca
                    WHERE ca.sme_id = %s
                    GROUP BY outreach_type
                """, (sme_id,))
            else:
                campaigns_by_type = await self.db.execute_query("""
                    SELECT 
                        outreach_type,
                        COUNT(*) as count
                    FROM campaign ca
                    GROUP BY outreach_type
                """)
            
            stats['campaigns_by_type'] = {
                'email': 0,
                'call': 0,
                'meeting': 0
            }
            for row in campaigns_by_type:
                outreach_type = row['outreach_type'].lower()
                if outreach_type in stats['campaigns_by_type']:
                    stats['campaigns_by_type'][outreach_type] = row['count']
            
            # Campaigns by status
            if sme_id:
                campaigns_by_status = await self.db.execute_query("""
                    SELECT 
                        status,
                        COUNT(*) as count
                    FROM campaign ca
                    WHERE ca.sme_id = %s
                    GROUP BY status
                """, (sme_id,))
            else:
                campaigns_by_status = await self.db.execute_query("""
                    SELECT 
                        status,
                        COUNT(*) as count
                    FROM campaign ca
                    GROUP BY status
                """)
            
            stats['campaigns_by_status'] = {
                'draft': 0,
                'scheduled': 0,
                'sent': 0
            }
            for row in campaigns_by_status:
                status = row['status'].lower()
                if status in stats['campaigns_by_status']:
                    stats['campaigns_by_status'][status] = row['count']
            
            # Companies by industry
            if sme_id:
                companies_by_industry = await self.db.execute_query("""
                    SELECT 
                        COALESCE(industry, 'Unknown') as industry,
                        COUNT(*) as count
                    FROM company c
                    WHERE c.sme_id = %s
                    GROUP BY industry
                    ORDER BY count DESC
                    LIMIT 10
                """, (sme_id,))
            else:
                companies_by_industry = await self.db.execute_query("""
                    SELECT 
                        COALESCE(industry, 'Unknown') as industry,
                        COUNT(*) as count
                    FROM company c
                    GROUP BY industry
                    ORDER BY count DESC
                    LIMIT 10
                """)
            
            stats['companies_by_industry'] = [
                {'industry': row['industry'], 'count': row['count']}
                for row in companies_by_industry
            ]
            
            # Analysis completion rate
            if sme_id:
                total_with_analysis = await self.db.execute_query("""
                    SELECT COUNT(DISTINCT c.company_id) as count
                    FROM company c
                    INNER JOIN analysis an ON c.company_id = an.company_id
                    WHERE an.status = 'COMPLETED' AND c.sme_id = %s
                """, (sme_id,))
            else:
                total_with_analysis = await self.db.execute_query("""
                    SELECT COUNT(DISTINCT c.company_id) as count
                    FROM company c
                    INNER JOIN analysis an ON c.company_id = an.company_id
                    WHERE an.status = 'COMPLETED'
                """)
            
            stats['analysis_completion_rate'] = (
                round((total_with_analysis[0]['count'] / stats['total_companies'] * 100), 2)
                if stats['total_companies'] > 0 and total_with_analysis and total_with_analysis[0]['count'] > 0 else 0
            )
            
            # Relevant articles percentage
            total_relevant = (stats['articles_by_classification'].get('Directly Relevant', 0) + 
                            stats['articles_by_classification'].get('Indirectly Useful', 0))
            stats['relevant_articles_percentage'] = (
                round((total_relevant / stats['total_articles'] * 100), 2)
                if stats['total_articles'] > 0 else 0
            )
            
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {str(e)}")
            # Return defaults
            stats = {
                'total_companies': 0,
                'total_articles': 0,
                'total_analyses': 0,
                'total_campaigns': 0,
                'companies_by_status': {'completed': 0, 'loading': 0, 'pending': 0, 'failed': 0},
                'articles_by_classification': {'Directly Relevant': 0, 'Indirectly Useful': 0, 'Not Relevant': 0},
                'campaigns_by_type': {'email': 0, 'call': 0, 'meeting': 0},
                'campaigns_by_status': {'draft': 0, 'scheduled': 0, 'sent': 0},
                'companies_by_industry': [],
                'analysis_completion_rate': 0,
                'relevant_articles_percentage': 0
            }
        
        return stats
    
    async def get_recent_activity(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent activity across available tables.

        Some deployments may not have all supporting tables (e.g., recommendation)
        initialized yet. Instead of failing the entire dashboard, we attempt to
        fetch activity from each table individually and skip any that error out.
        """

        queries = [
            (
                "recommendation",
                "SELECT 'recommendation' AS type, rec_id AS id, recommendation_text AS content, "
                "date_generated AS date, 'sme' AS source FROM recommendation "
                "ORDER BY date_generated DESC LIMIT %s",
            ),
            (
                "analysis",
                "SELECT 'analysis' AS type, analysis_id AS id, latest_updates AS content, "
                "date_analyzed AS date, 'company' AS source FROM analysis "
                "ORDER BY date_analyzed DESC LIMIT %s",
            ),
            (
                "article",
                "SELECT 'article' AS type, article_id AS id, title AS content, "
                "published_date AS date, 'company' AS source FROM article "
                "ORDER BY published_date DESC LIMIT %s",
            ),
        ]

        activities: List[Dict[str, Any]] = []

        for source, query in queries:
            try:
                rows = await self.db.execute_query(query, (limit,))
                activities.extend(rows)
            except Exception as e:
                logger.warning(
                    "Skipping recent activity from %s due to error: %s", source, str(e)
                )
                continue

        # Sort combined activities by date (most recent first) and cap to limit
        def _sort_key(item: Dict[str, Any]):
            value = item.get("date")
            if isinstance(value, datetime):
                return value
            if isinstance(value, date):
                return datetime.combine(value, datetime.min.time())
            if isinstance(value, str):
                for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S"):
                    try:
                        return datetime.strptime(value, fmt)
                    except ValueError:
                        continue
            return datetime.min

        activities.sort(key=_sort_key, reverse=True)

        return activities[:limit]
    
    # Campaign/Outreach Operations
    async def create_campaign(self, sme_id: int, company_id: int, outreach_type: str, title: str, content: str) -> int:
        """Create a new campaign"""
        query = """
        INSERT INTO campaign (sme_id, company_id, outreach_type, title, content, status, generated_at)
        VALUES (%s, %s, %s, %s, %s, 'draft', NOW())
        """
        return await self.db.execute_insert(query, (sme_id, company_id, outreach_type, title, content))
    
    async def get_campaign_by_id(self, campaign_id: int) -> Optional[Dict[str, Any]]:
        """Get campaign by ID"""
        query = """
        SELECT c.*, comp.name as company_name, s.name as sme_name
        FROM campaign c
        JOIN company comp ON c.company_id = comp.company_id
        JOIN sme s ON c.sme_id = s.sme_id
        WHERE c.campaign_id = %s
        """
        results = await self.db.execute_query(query, (campaign_id,))
        return results[0] if results else None
    
    async def get_campaigns_for_sme(self, sme_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all campaigns for an SME"""
        query = """
        SELECT c.*, comp.name as company_name
        FROM campaign c
        JOIN company comp ON c.company_id = comp.company_id
        WHERE c.sme_id = %s
        ORDER BY c.generated_at DESC
        LIMIT %s
        """
        return await self.db.execute_query(query, (sme_id, limit))
    
    async def get_campaigns_for_company(self, company_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """Get all campaigns for a company"""
        query = """
        SELECT c.*, comp.name as company_name, s.name as sme_name
        FROM campaign c
        JOIN company comp ON c.company_id = comp.company_id
        JOIN sme s ON c.sme_id = s.sme_id
        WHERE c.company_id = %s
        ORDER BY c.generated_at DESC
        LIMIT %s
        """
        return await self.db.execute_query(query, (company_id, limit))
    
    async def update_campaign_status(self, campaign_id: int, status: str, sent_at: Optional[str] = None) -> bool:
        """Update campaign status"""
        if sent_at:
            query = "UPDATE campaign SET status = %s, sent_at = %s WHERE campaign_id = %s"
            affected_rows = await self.db.execute_update(query, (status, sent_at, campaign_id))
        else:
            query = "UPDATE campaign SET status = %s WHERE campaign_id = %s"
            affected_rows = await self.db.execute_update(query, (status, campaign_id))
        return affected_rows > 0
    
    async def delete_campaign(self, campaign_id: int) -> bool:
        """Delete campaign by ID"""
        query = "DELETE FROM campaign WHERE campaign_id = %s"
        affected_rows = await self.db.execute_update(query, (campaign_id,))
        return affected_rows > 0


# Global service instance
inspire_db = InspireDatabaseService()
