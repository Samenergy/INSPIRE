/**
 * Partner Finder Service
 * Handles AI-powered partner discovery API calls
 */

const API_BASE_URL = 'https://api.inspire.software/api/v1/partners';

export interface Partner {
  company_id: number;
  name: string;
  location: string;
  website?: string;
  phone?: string;
  organisation_type?: string;
}

export interface AutoFindPartnersResponse {
  success: boolean;
  message: string;
  data?: {
    partners_found: number;
    partners_saved: number;
    partners: Partner[];
    analysis_jobs?: Array<{
      company_id: number;
      company_name: string;
      job_id: string;
      task_id?: string;
    }>;
    search_queries_used: string[];
    total_businesses_found: number;
  };
  error?: string;
  timestamp: string;
}

class PartnerFinderService {
  /**
   * Get authorization header (always get fresh token from localStorage)
   */
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeader(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Automatically find partners using AI
   */
  async autoFindPartners(location?: string): Promise<AutoFindPartnersResponse> {
    const formData = new FormData();
    if (location) {
      formData.append('location', location);
    }

    const url = `${API_BASE_URL}/auto-find`;
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 429 (Too Many Requests) specifically
        if (response.status === 429) {
          const errorMessage = data.detail || data.message || 'A partner search is already in progress. Please wait for it to complete.';
          const error = new Error(errorMessage);
          (error as any).status = 429;
          throw error;
        }
        throw new Error(data.detail || data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const partnerFinderService = new PartnerFinderService();
export default partnerFinderService;

