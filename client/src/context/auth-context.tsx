// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ApiService } from '../services/apiService';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [api, setApi] = useState<ApiService | null>(null);

	useEffect(() => {
		const apiService = new ApiService({ token, logout });
		setApi(apiService);
		
		const storedToken = localStorage.getItem('token');
		const storedUser = localStorage.getItem('user');

		if (storedToken && storedUser) {
			setToken(storedToken);
			try {
				setUser(JSON.parse(storedUser));
			} catch (error) {
				console.error('Failed to parse stored user:', error);
				localStorage.removeItem('user');
				localStorage.removeItem('token');
			}
		}
		setLoading(false);
	}, [token]);

	const signup = async (email: string, password: string, firstname: string, lastname: string, username: string): Promise<boolean> => {
		try {
			const data = await api?.register({ email, password, firstname, lastname, username });

			if (data) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify(data.user));

				setToken(data.token);
				setUser(data.user);

				return true;
			}
			return false;
		} catch (error) {
			console.error('Signup error:', error);
			return false;
		}
	}

	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const data = await api?.login({ email, password });

			if (data) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify(data.user));

				setToken(data.token);
				setUser(data.user);

				return true;
			}
			return false;
		} catch (error) {
			console.error('Login error:', error);
			return false;
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setToken(null);
		setUser(null);
	};

	const refreshToken = async (): Promise<boolean> => {
		try {
			const data = await api?.refreshToken();
			if (data) {
				localStorage.setItem('token', data.token);
				setToken(data.token);
				return true;
			}
			return false;
		} catch (error) {
			console.error('Token refresh error:', error);
			logout();
			return false;
		}
	};

	const value: AuthContextType = {
		user,
		token,
		loading,
		api,
		login,
		signup,
		logout,
		refreshToken,
		isAuthenticated: !!token,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};