-- MySQL setup script for company_data database
CREATE DATABASE IF NOT EXISTS company_data;
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON company_data.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

