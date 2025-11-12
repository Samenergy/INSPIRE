/**
 * Authentication Service
 * Handles SME signup, login, and token management
 */

const API_BASE_URL = 'http://46.62.228.201:8000/api/auth';

export interface SMESignupBasicData {
  name: string;
  contact_email: string;
  password: string;
}

export interface SMESignupCompleteData {
  name: string;
  sector: string;
  objective: string;
  contact_email: string;
  password: string;
}

export interface SMEUpdateData {
  sector: string;
  objective: string;
}

export interface SMELoginData {
  contact_email: string;
  password: string;
}

export interface SME {
  sme_id: number;
  name: string;
  sector: string;
  objective: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    sme: SME;
    access_token: string;
    token_type: string;
  };
  error?: string;
  timestamp: string;
}

export interface SMESetupData {
  sector: string;
  objective: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
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
   * SME Basic Signup (name, email, password only)
   */
  async signupBasic(signupData: SMESignupBasicData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  /**
   * SME Complete Signup (all information)
   */
  async signupComplete(signupData: SMESignupCompleteData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/signup/complete', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  /**
   * Update SME Profile (sector and objective)
   */
  async updateProfile(updateData: SMEUpdateData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * SME Login
   */
  async login(loginData: SMELoginData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  /**
   * Get current SME information
   */
  async getCurrentSME(): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/me');
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/verify-token', {
      method: 'POST',
    });
  }

  /**
   * Logout (clear local token)
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * Complete basic signup flow with automatic login
   */
  async completeBasicSignup(signupData: SMESignupBasicData): Promise<AuthResponse> {
    try {
      // First, basic signup
      const signupResponse = await this.signupBasic(signupData);
      
      if (signupResponse.success && signupResponse.data) {
        // Set token from signup response
        this.setToken(signupResponse.data.access_token);
        return signupResponse;
      } else {
        throw new Error(signupResponse.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Complete basic signup failed:', error);
      throw error;
    }
  }

  /**
   * Complete full signup flow with automatic login
   */
  async completeFullSignup(signupData: SMESignupCompleteData): Promise<AuthResponse> {
    try {
      // Complete signup with all information
      const signupResponse = await this.signupComplete(signupData);
      
      if (signupResponse.success && signupResponse.data) {
        // Set token from signup response
        this.setToken(signupResponse.data.access_token);
        return signupResponse;
      } else {
        throw new Error(signupResponse.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Complete full signup failed:', error);
      throw error;
    }
  }

  /**
   * Complete login flow
   */
  async completeLogin(loginData: SMELoginData): Promise<AuthResponse> {
    try {
      // Login
      const loginResponse = await this.login(loginData);
      
      if (loginResponse.success && loginResponse.data) {
        // Set token from login response
        this.setToken(loginResponse.data.access_token);
        return loginResponse;
      } else {
        throw new Error(loginResponse.message || 'Login failed');
      }
    } catch (error) {
      console.error('Complete login failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
