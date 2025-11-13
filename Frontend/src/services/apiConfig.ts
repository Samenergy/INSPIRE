/**
 * API Configuration
 * Centralized configuration for API base URLs
 * 
 * Automatically detects HTTPS/HTTP based on current page protocol
 * to avoid mixed content errors
 */

// Get API base URL from environment variable or use default
const getApiBaseUrl = (): string => {
  // Use environment variable if available (highest priority)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Check if we're in production (HTTPS)
  // If page is loaded over HTTPS, API must also use HTTPS to avoid mixed content errors
  const isProduction = window.location.protocol === 'https:';
  
  // Default configuration
  const API_HOST = '46.62.228.201';
  
  if (isProduction) {
    // Use HTTPS on port 443 (standard HTTPS port) when page is loaded over HTTPS
    // Nginx handles SSL termination on port 443
    return `https://${API_HOST}`;
  }
  
  // Use HTTP on port 8000 for local development
  return `http://${API_HOST}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoint paths
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  V1: `${API_BASE_URL}/api/v1`,
  INSPIRE: `${API_BASE_URL}/api/inspire`,
  OUTREACH: `${API_BASE_URL}/api/outreach`,
} as const;

// Export individual endpoints for convenience
export const AUTH_API_URL = API_ENDPOINTS.AUTH;
export const V1_API_URL = API_ENDPOINTS.V1;
export const INSPIRE_API_URL = API_ENDPOINTS.INSPIRE;
export const OUTREACH_API_URL = API_ENDPOINTS.OUTREACH;
