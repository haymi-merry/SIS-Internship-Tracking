import { data } from '@remix-run/router';
import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'https://aau-intern-b.vercel.app/aau_api/';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ADMIN INTERFACES
export interface AdminStudent {
  id: number;
  university_id: string;
  institutional_email: string;
  full_name: string;
  phone_number: string;
  telegram_id: string;
  status: 'Pending' | 'Ongoing' | 'Behind Schedule' | 'Completed';
  start_date: string | null;
  end_date: string | null;
  student_grade: number;
  assigned_advisor: number | null;
}

export interface Advisor {
  id: number;
  phone_number: string;
  first_name: string;
  last_name: string;
  user: number;
}

// ADVISOR INTERFACES
export interface Student {
  id: number;
  university_id: string;
  institutional_email: string;
  full_name: string;
  phone_number: string;
  telegram_id: string;
  status: 'Pending' | 'Ongoing' | 'Behind Schedule' | 'Completed';
  start_date: string | null;
  end_date: string | null;
  student_grade: number;
  assigned_advisor: number;
  internship_offer_letter: {
    id: number;
    document: string;
    advisor_approved: boolean;
    submission_date: string;
    approval_date: string | null;
    student: number;
  } | null;
  internship_reports: {
    id: number;
    document: string;
    submission_date: string;
    advisor_approved: boolean;
    grade: number;
    student: number;
  }[];
}

export interface StudentsResponse {
  students: Student[];
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private authTokens: AuthTokens | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const storedTokens = localStorage.getItem('authTokens');
    if (storedTokens) {
      this.authTokens = JSON.parse(storedTokens);
    }

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authTokens?.access) {
          config.headers.Authorization = `Bearer ${this.authTokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && this.authTokens?.refresh) {
          originalRequest._retry = true;
          
          try {
            const tokens = await this.refreshToken();
            if (tokens) {
              originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.clearAuthTokens();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // ================= AUTH METHODS =================
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await this.axiosInstance.post('advisor/login/', credentials);
      this.setAuthTokens(response.data);
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async register(advisorData: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await this.axiosInstance.post('advisor/register/', advisorData);
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await this.axiosInstance.post('advisor/logout/', {
        refresh: this.authTokens?.refresh,
      });
      this.clearAuthTokens();
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async refreshToken(): Promise<AuthTokens | null> {
    if (!this.authTokens?.refresh) return null;
    
    try {
      const response = await this.axiosInstance.post('auth/token/refresh/', {
        refresh: this.authTokens.refresh,
      });
      const newTokens = {
        access: response.data.access,
        refresh: this.authTokens.refresh,
      };
      this.setAuthTokens(newTokens);
      return newTokens;
    } catch (error) {
      throw error;
    }
  }

  // ================= ADMIN METHODS =================
  async getAdminStudents(): Promise<ApiResponse<AdminStudent[]>> {
    try {
      const response = await this.axiosInstance.get('internship/students/');
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }
  async getStudentDetail(universityId: string): Promise<ApiResponse<Student>> {
    try {
      // Validate ID format before making the request
      if (!universityId || !/^[A-Z]+\d+$/.test(universityId)) {
        throw new Error(`Invalid university ID format: ${universityId}`);
      }
      
      const response = await this.axiosInstance.get(`advisor/students/${universityId}/`);
      
      // Check for empty response
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      return { data: response.data };
    } catch (error) {
      console.error('API Error Details:', {
        error,
        url: `advisor/students/${universityId}/`,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return { 
        error: this.getErrorMessage(error) || 'Failed to load student details' 
      };
    }
  }

  async getAdvisors(): Promise<ApiResponse<Advisor[]>> {
    try {
      const response = await this.axiosInstance.get('internship/advisors/');
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async assignAdvisor(university_id: string, advisor_username: string): Promise<ApiResponse<{message: string}>> {
    try {
      // Log what's being sent to help with debugging
      console.log('Sending assign request with:', {
        university_id,
        advisor_username
      });
      
      const response = await this.axiosInstance.post(
        'internship/assign-advisor/',
        {
          university_id,
          advisor_username
        }
      );
      return { data: response.data };
    } catch (error) {
      console.error('Assign advisor error:', error);
      return { error: this.getErrorMessage(error) };
    }
  }

  // ================= ADVISOR METHODS =================
  async getStudents(): Promise<ApiResponse<StudentsResponse>> {
    try {
      const response = await this.axiosInstance.get('advisor/students/');
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async approveOfferLetter(data: {
    university_id: string;
    status: 'Approved' | 'Rejected';
  }): Promise<ApiResponse<{
    message: string;
    student_name: string;
    student_university_id: string;
    advisor_approved: boolean;
    approval_date: string;
  }>> {
    try {
      const response = await this.axiosInstance.put('advisor/approve-offer-letter/', data);
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async rejectOfferLetter(studentId: string, feedback: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.axiosInstance.post(
        `advisor/students/${studentId}/reject-offer-letter/`,
        { feedback }
      );
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async approveReport(studentId: string, reportId: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.axiosInstance.post(
        `advisor/students/${studentId}/reports/${reportId}/approve/`
      );
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  async rejectReport(studentId: string, reportId: number, feedback: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.axiosInstance.post(
        `advisor/students/${studentId}/reports/${reportId}/reject/`,
        { feedback }
      );
      return { data: response.data };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  // ================= UTILITY METHODS =================
  setAuthTokens(tokens: AuthTokens): void {
    this.authTokens = tokens;
    localStorage.setItem('authTokens', JSON.stringify(tokens));
  }

  clearAuthTokens(): void {
    this.authTokens = null;
    localStorage.removeItem('authTokens');
  }

  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || 
             error.response?.data?.detail || 
             error.message || 
             'Request failed';
    }
    return 'An unknown error occurred';
  }
}

export const api = new ApiService();