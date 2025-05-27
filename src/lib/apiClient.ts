
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Visitor methods
  async getVisitors() {
    return this.request<any[]>('/visitors');
  }

  async getVisitor(id: string) {
    return this.request<any>(`/visitors/${id}`);
  }

  async createVisitor(visitor: any) {
    return this.request<any>('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitor),
    });
  }

  async updateVisitor(id: string, updates: any) {
    return this.request<any>(`/visitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteVisitor(id: string) {
    return this.request<any>(`/visitors/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings methods
  async getSettings(category?: string) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<Record<string, any>>(`/settings${params}`);
  }

  async updateSetting(key: string, value: any, category = 'general') {
    return this.request<any>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, category }),
    });
  }

  async getVisitorCounter() {
    return this.request<{ value: number }>('/settings/counter/visitor');
  }

  async updateVisitorCounter(value: number) {
    return this.request<any>('/settings/counter/visitor', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // Export/Import methods
  async exportData() {
    try {
      const response = await fetch(`${this.baseUrl}/export/all`);
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  async importData(data: any) {
    return this.request<any>('/export/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
