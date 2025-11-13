/**
 * Company Service
 * Handles fetching companies from the backend API
 */

const API_BASE_URL = 'http://46.62.228.201:8000/api/v1';

export interface Company {
  company_id: number;
  sme_id: number | null;
  name: string;
  location: string | null;
  description: string | null;
  industry: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

class CompanyService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Get authorization header
   */
  private getAuthHeader(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
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
        'Content-Type': 'application/json',
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
   * Get all companies
   */
  async getAllCompanies(): Promise<Company[]> {
    const response = await this.makeRequest<ApiResponse<Company[]>>('/companies');
    return response.data || [];
  }

  /**
   * Get company by ID
   */
  async getCompanyById(company_id: number): Promise<Company> {
    const response = await this.makeRequest<ApiResponse<Company>>(`/companies/${company_id}`);
    if (!response.data) {
      throw new Error('Company not found');
    }
    return response.data;
  }

  /**
   * Search company by name
   */
  async searchCompanyByName(name: string): Promise<Company> {
    const response = await this.makeRequest<ApiResponse<Company>>(
      `/companies/search?name=${encodeURIComponent(name)}`
    );
    if (!response.data) {
      throw new Error('Company not found');
    }
    return response.data;
  }

  /**
   * Create a new company
   */
  async createCompany(company: Partial<Company>): Promise<Company> {
    const response = await this.makeRequest<ApiResponse<Company>>('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
    if (!response.data) {
      throw new Error('Failed to create company');
    }
    return response.data;
  }
}

// Export singleton instance
export const companyService = new CompanyService();
export default companyService;


