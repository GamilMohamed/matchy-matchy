// types/auth.ts
export interface User {
  id: string;
  email: string;
  firstname: string;
  createdAt: string;
  profileComplete: boolean;
  username: string;

  gender?: string;
  sexualPreferences?: string;
  biography: string;
  interests: string[];
  pictures: File[];
  profilePicture: File | null;
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
  birthdate: string;
  password: string;
}

export interface UpdateProfileData {
  gender: string;
  sexualPreferences: string;
  biography: string;
  interests: string[];
  pictures?: File[];
  profilePicture: File | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export interface MyError {
      message: string;
}