// types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
  profileComplete: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstname: string;
  username: string;
  lastname: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  api: ApiService | null;
  signup: (email: string, password: string, firstname: string, lastname: string, username: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
}

export interface ApiError extends Error {
  status?: number;
  data?: any;
}
