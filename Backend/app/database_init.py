"""
Database Initialization Module
Creates database and all tables if they don't exist
"""

import logging
import pymysql
from pymysql.constants import CLIENT
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_connection_config_without_db() -> dict:
    """Get connection config without database name (to create database)"""
    return {
        'host': settings.db_host,
        'port': settings.db_port,
        'user': settings.db_user,
        'password': settings.db_password,
        'charset': 'utf8mb4',
        'client_flag': CLIENT.MULTI_STATEMENTS,
        'connect_timeout': 30,
    }


def get_connection_config() -> dict:
    """Get database connection configuration"""
    return {
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


def create_database_if_not_exists() -> bool:
    """Create database if it doesn't exist"""
    try:
        connection = pymysql.connect(**get_connection_config_without_db())
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {settings.db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            logger.info(f"✅ Database '{settings.db_name}' is ready")
        
        connection.close()
        return True
    except Exception as e:
        logger.error(f"❌ Error creating database: {str(e)}")
        return False


def table_exists(connection, table_name: str) -> bool:
    """Check if a table exists in the database"""
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = %s AND table_name = %s
            """, (settings.db_name, table_name))
            result = cursor.fetchone()
            return result['count'] > 0 if result else False
    except Exception as e:
        logger.error(f"Error checking if table {table_name} exists: {str(e)}")
        return False


def create_all_tables() -> bool:
    """Create all tables if they don't exist"""
    try:
        connection = pymysql.connect(**get_connection_config())
        
        # Create SME table
        if not table_exists(connection, 'sme'):
            logger.info("Creating 'sme' table...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sme (
                        sme_id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        sector VARCHAR(100) NOT NULL,
                        objective TEXT,
                        contact_email VARCHAR(255) NOT NULL UNIQUE,
                        password_hash VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        
                        INDEX idx_sme_email (contact_email),
                        INDEX idx_sme_sector (sector),
                        INDEX idx_sme_created (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                connection.commit()
                logger.info("✅ Created 'sme' table")
        else:
            logger.info("✅ 'sme' table already exists")
        
        # Create Company table
        if not table_exists(connection, 'company'):
            logger.info("Creating 'company' table...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS company (
                        company_id INT AUTO_INCREMENT PRIMARY KEY,
                        sme_id INT,
                        name VARCHAR(255) NOT NULL,
                        location VARCHAR(255),
                        description TEXT,
                        industry VARCHAR(100),
                        website VARCHAR(255),
                        company_info TEXT,
                        strengths TEXT,
                        opportunities TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        
                        INDEX idx_company_name (name),
                        INDEX idx_company_industry (industry),
                        INDEX idx_company_location (location),
                        INDEX idx_company_sme (sme_id),
                        INDEX idx_company_created (created_at),
                        
                        CONSTRAINT fk_company_sme FOREIGN KEY (sme_id) REFERENCES sme(sme_id) ON DELETE SET NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                connection.commit()
                logger.info("✅ Created 'company' table")
        else:
            logger.info("✅ 'company' table already exists")
            # Add missing columns if they don't exist (migration)
            with connection.cursor() as cursor:
                # Check and add company_info column
                cursor.execute("""
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = %s AND table_name = 'company' AND column_name = 'company_info'
                """, (settings.db_name,))
                if cursor.fetchone()['count'] == 0:
                    cursor.execute("ALTER TABLE company ADD COLUMN company_info TEXT AFTER website")
                    logger.info("✅ Added 'company_info' column to 'company' table")
                
                # Check and add strengths column
                cursor.execute("""
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = %s AND table_name = 'company' AND column_name = 'strengths'
                """, (settings.db_name,))
                if cursor.fetchone()['count'] == 0:
                    cursor.execute("ALTER TABLE company ADD COLUMN strengths TEXT AFTER company_info")
                    logger.info("✅ Added 'strengths' column to 'company' table")
                
                # Check and add opportunities column
                cursor.execute("""
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = %s AND table_name = 'company' AND column_name = 'opportunities'
                """, (settings.db_name,))
                if cursor.fetchone()['count'] == 0:
                    cursor.execute("ALTER TABLE company ADD COLUMN opportunities TEXT AFTER strengths")
                    logger.info("✅ Added 'opportunities' column to 'company' table")
                
                connection.commit()
        
        # Create Analysis table
        if not table_exists(connection, 'analysis'):
            logger.info("Creating 'analysis' table...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS analysis (
                        analysis_id INT AUTO_INCREMENT PRIMARY KEY,
                        company_id INT NOT NULL,
                        latest_updates TEXT,
                        challenges TEXT,
                        decision_makers TEXT,
                        market_position TEXT,
                        future_plans TEXT,
                        action_plan TEXT,
                        solutions TEXT,
                        analysis_type ENUM('comprehensive', 'hybrid', 'intelligence', 'summarization') DEFAULT 'comprehensive',
                        confidence_score DECIMAL(3,2) DEFAULT 0.00,
                        date_analyzed DATE NOT NULL,
                        status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED') DEFAULT 'COMPLETED',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        
                        INDEX idx_analysis_company (company_id),
                        INDEX idx_analysis_type (analysis_type),
                        INDEX idx_analysis_date (date_analyzed),
                        INDEX idx_analysis_status (status),
                        INDEX idx_analysis_company_date (company_id, date_analyzed DESC),
                        
                        CONSTRAINT fk_analysis_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                connection.commit()
                logger.info("✅ Created 'analysis' table")
        else:
            logger.info("✅ 'analysis' table already exists")
        
        # Create Article table
        if not table_exists(connection, 'article'):
            logger.info("Creating 'article' table...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS article (
                        article_id INT AUTO_INCREMENT PRIMARY KEY,
                        company_id INT NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        url VARCHAR(255) NOT NULL,
                        content TEXT,
                        source VARCHAR(100),
                        published_date DATE,
                        relevance_score DECIMAL(3,2) DEFAULT 0.00,
                        classification ENUM('Directly Relevant', 'Indirectly Useful', 'Not Relevant', 'news', 'update', 'announcement', 'financial', 'partnership', 'product', 'other') DEFAULT 'Not Relevant',
                        sentiment ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        
                        INDEX idx_article_company (company_id),
                        INDEX idx_article_classification (classification),
                        INDEX idx_article_sentiment (sentiment),
                        INDEX idx_article_published (published_date),
                        INDEX idx_article_relevance (relevance_score),
                        INDEX idx_article_url (url),
                        INDEX idx_article_company_classification (company_id, classification),
                        INDEX idx_article_company_published (company_id, published_date DESC),
                        
                        CONSTRAINT fk_article_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                connection.commit()
                logger.info("✅ Created 'article' table")
        else:
            logger.info("✅ 'article' table already exists")
        
        # Create Recommendation table
        if not table_exists(connection, 'recommendation'):
            logger.info("Creating 'recommendation' table...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS recommendation (
                        rec_id INT AUTO_INCREMENT PRIMARY KEY,
                        sme_id INT NOT NULL,
                        company_id INT NOT NULL,
                        recommendation_text TEXT NOT NULL,
                        confidence_score DECIMAL(3,2) DEFAULT 0.00,
                        date_generated DATE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        
                        INDEX idx_recommendation_sme (sme_id),
                        INDEX idx_recommendation_company (company_id),
                        INDEX idx_recommendation_date (date_generated),
                        INDEX idx_recommendation_confidence (confidence_score),
                        INDEX idx_recommendation_sme_date (sme_id, date_generated DESC),
                        
                        CONSTRAINT fk_recommendation_sme FOREIGN KEY (sme_id) REFERENCES sme(sme_id) ON DELETE CASCADE,
                        CONSTRAINT fk_recommendation_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                connection.commit()
                logger.info("✅ Created 'recommendation' table")
        else:
            logger.info("✅ 'recommendation' table already exists")
        
        # Create Campaign table
        if not table_exists(connection, 'campaign'):
            logger.info("Creating 'campaign' table...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS campaign (
                        campaign_id INT AUTO_INCREMENT PRIMARY KEY,
                        sme_id INT NOT NULL,
                        company_id INT NOT NULL,
                        outreach_type ENUM('email', 'call', 'meeting') NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        content TEXT NOT NULL,
                        status ENUM('draft', 'sent', 'scheduled', 'completed') DEFAULT 'draft',
                        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        scheduled_at TIMESTAMP NULL,
                        sent_at TIMESTAMP NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        
                        INDEX idx_campaign_sme (sme_id),
                        INDEX idx_campaign_company (company_id),
                        INDEX idx_campaign_type (outreach_type),
                        INDEX idx_campaign_status (status),
                        INDEX idx_campaign_generated (generated_at),
                        INDEX idx_campaign_sme_type (sme_id, outreach_type),
                        INDEX idx_campaign_company_type (company_id, outreach_type),
                        
                        CONSTRAINT fk_campaign_sme FOREIGN KEY (sme_id) REFERENCES sme(sme_id) ON DELETE CASCADE,
                        CONSTRAINT fk_campaign_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                connection.commit()
                logger.info("✅ Created 'campaign' table")
        else:
            logger.info("✅ 'campaign' table already exists")
        
        connection.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating tables: {str(e)}")
        return False


def initialize_database() -> bool:
    """
    Initialize database - create database and all tables if they don't exist
    Returns True if successful, False otherwise
    """
    logger.info("🚀 Initializing database...")
    
    # Step 1: Create database if it doesn't exist
    if not create_database_if_not_exists():
        logger.error("❌ Failed to create database")
        return False
    
    # Step 2: Create all tables if they don't exist
    if not create_all_tables():
        logger.error("❌ Failed to create tables")
        return False
    
    logger.info("✅ Database initialization completed successfully")
    return True


if __name__ == "__main__":
    # Allow running this script directly for testing
    initialize_database()
