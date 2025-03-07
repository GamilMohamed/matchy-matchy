// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import axios from "axios";
import { MyError, RegisterData, UpdateProfileData } from "../types/auth";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { User } from "@/types/auth";

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  register: (userData: RegisterData) => Promise<unknown>;
  updateProfile: (userData: UpdateProfileData) => Promise<unknown>;
  logout: () => void;
  profileCompleted: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a configured axios instance
const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  const [profileCompleted, setProfileCompleted] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setProfileCompleted(user.profileComplete || false);
    }
  }, [user]);
  const handleRequest = async (requestFn: () => Promise<unknown>, successMessage?: string) => {
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
      const errorMsg = axios.isAxiosError(err) ? (err as AxiosError<MyError>).response?.data?.message || "Operation failed" : "An unexpected error occurred";

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

  useEffect(() => {
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
    return await handleRequest(() => api.post("/auth/signup", userData), "Registration successful! Please log in.");
  };

  // Update profile function
  const updateProfile = async (userData: UpdateProfileData) => {
    const convertedData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (key === "profilePicture" && value instanceof File) {
        convertedData.append(key, value as File);
      } else if (key === "interests" && value) {
        (value as string[]).forEach((interest) => {
          convertedData.append("interests[]", interest);
        });
      } else if (key === "location" && value) {
        Object.entries(value as Record<string, string>).forEach(([locKey, locValue]) => {
          convertedData.append(`location[${locKey}]`, locValue);
        });
      } else if (key === "pictures" && value) {
        (value as File[]).forEach((picture) => {
          convertedData.append("pictures[]", picture);
        });
      } else {
        convertedData.append(key, value as string);
      }
    });

    await handleRequest(() => axios.put("http://localhost:3000/users/profile", convertedData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    ), "Profile updated successfully!").then(() => loadUser());
  }
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
    profileCompleted,
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
