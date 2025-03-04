// services/apiService.ts
import { AuthResponse, LoginCredentials, RegisterData, User } from "../types/auth";

interface ApiServiceContext {
  token: string | null;
  logout: () => void;
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export class ApiService {
  private baseUrl: string;
  private authContext: ApiServiceContext;

  constructor(authContext: ApiServiceContext) {
    this.baseUrl = "http://localhost:3000";
    this.authContext = authContext;
  }

  private getHeaders(): Record<string, string> {
    const { token } = this.authContext;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log('response', response);
    if (response.status === 401) {
      this.authContext.logout();
      throw new Error("Session expired. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to perform this action.");
    }
	console.log('response', response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
    });
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    return this.request<User>("/users/profile");
  }

  async updateUserProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Example resource endpoints
  async getItems<T>(params: Record<string, string> = {}): Promise<T[]> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<T[]>(`/items?${queryString}`);
  }

  async getItemById<T>(id: string): Promise<T> {
    return this.request<T>(`/items/${id}`);
  }

  async createItem<T>(itemData: Partial<T>): Promise<T> {
    return this.request<T>("/items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  }

  async updateItem<T>(id: string, itemData: Partial<T>): Promise<T> {
    return this.request<T>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id: string): Promise<void> {
    return this.request<void>(`/items/${id}`, {
      method: "DELETE",
    });
  }
}
