// types/auth.ts
export interface User  extends UpdateProfileData {
  email: string;
  firstname: string;
  lastname: string;
  birthDate: string;
  createdAt: string;
  profileComplete: boolean;
  username: string;
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
  authorizeLocation: boolean;
  location: {
    latitude: number,
    longitude: number,
    city: string,
    country: string,
  }
  biography: string;
  interests: string[];
  pictures?: File[] | string[];
  profilePicture: string | File | null;
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