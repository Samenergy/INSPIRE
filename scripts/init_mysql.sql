-- MySQL initialization script for company data scraping service

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS company_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE company_data;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON company_data.* TO 'app_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Create tables
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    industry VARCHAR(255),
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_scraped DATETIME,
    scrape_count INT NOT NULL DEFAULT 0,
    INDEX idx_name (name),
    INDEX idx_location (location),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    url VARCHAR(1000) NOT NULL,
    source VARCHAR(255) NOT NULL,
    published_date DATETIME,
    scraped_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(50) NOT NULL,
    raw_data JSON,
    INDEX idx_company_id (company_id),
    INDEX idx_published_date (published_date),
    INDEX idx_scraped_at (scraped_at),
    INDEX idx_company_published (company_id, published_date),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(500),
    meta_description TEXT,
    content_hash VARCHAR(64) NOT NULL,
    scraped_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(50) NOT NULL,
    raw_data JSON,
    INDEX idx_company_id (company_id),
    INDEX idx_scraped_at (scraped_at),
    INDEX idx_content_hash (content_hash),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_registry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    registration_number VARCHAR(100),
    registration_date DATETIME,
    legal_status VARCHAR(100),
    business_type VARCHAR(100),
    registered_address TEXT,
    officers JSON,
    scraped_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(50) NOT NULL,
    raw_data JSON,
    INDEX idx_company_id (company_id),
    INDEX idx_registration_number (registration_number),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scrape_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    data_sources JSON NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at DATETIME,
    completed_at DATETIME,
    error_message TEXT,
    results JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNIQUE NOT NULL,
    news_count INT NOT NULL DEFAULT 0,
    website_updates_count INT NOT NULL DEFAULT 0,
    business_registry_count INT NOT NULL DEFAULT 0,
    sentiment_score FLOAT,
    key_topics JSON,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    INDEX idx_generated_at (generated_at),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT IGNORE INTO companies (name, location, website, industry, description) VALUES
('Acme Corporation', 'San Francisco, CA', 'https://acme.com', 'Technology', 'Leading technology company'),
('TechStart Inc', 'New York, NY', 'https://techstart.com', 'Software', 'Innovative software solutions'),
('Global Industries Ltd', 'London, UK', 'https://globalindustries.com', 'Manufacturing', 'International manufacturing company');

-- Show created tables
SHOW TABLES;

-- Show table structures
DESCRIBE companies;
DESCRIBE news_articles;
DESCRIBE website_updates;
DESCRIBE business_registry;
DESCRIBE scrape_jobs;
DESCRIBE company_insights;


