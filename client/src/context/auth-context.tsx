// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import axios from "axios";
import { MyError, RegisterData, UpdateProfileData } from "../types/auth";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from 'axios';

// Simple user type
interface User {
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  birthdate?: string;
  gender?: string;
  sexualPreferences?: string;
  biography?: string;
  interests?: string[];
  pictures?: File[];
  profilePicture?: File | null;
  profileComplete?: boolean;

  // [key: string]: unknown; // For any additional fields
}

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  register: (userData: RegisterData) => Promise<unknown>;
  updateProfile: (userData: UpdateProfileData) => Promise<unknown>;
  logout: () => void;
  
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a configured axios instance
const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  },
});

// Add request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  
  const handleRequest = async (
    requestFn: () => Promise<unknown>,
    successMessage?: string
  ) => {
    try {
      setLoading(true);
      const result = await requestFn();
      
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      return result;
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) 
        ? (err as AxiosError<MyError>).response?.data?.message || "Operation failed" 
        : "An unexpected error occurred";
        
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Load user when token changes
  useEffect(() => {
    
    const loadUser = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const res = await api.get("/users/me");
        setUser(res.data);
        console.log("User loaded:", res.data);
      } catch (err) {
        console.error("Error loading user:", err);
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    return await handleRequest(async () => {
      const response = await api.post("/auth/signin", { email, password });
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      return response;
    });
  };


  // Register function
  const register = async (userData: RegisterData) => {
    return handleRequest(
      () => api.post("/auth/signup", userData),
      "Registration successful! Please log in."
    );
  };
  const updateProfile = async (userData: UpdateProfileData) => {
    handleRequest(
      () => api.put("/users/profile", userData),
      "Profile updated successfully"
    );
    // window.location.reload();
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    logout,
    login,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Export the configured axios instance
export { api };
