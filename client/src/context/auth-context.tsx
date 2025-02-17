import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
	isAuth: boolean;
	setIsAuth: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
	children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
	const [isAuth, setIsAuthState] = useState(() => {
		const cookieValue = Cookies.get('isAuth');
		return cookieValue === 'true';
	});

	const setIsAuth = (value: boolean) => {
		setIsAuthState(value);
		Cookies.set('isAuth', value.toString(), { secure: true });
	};

	return (
		<AuthContext.Provider value={{ isAuth, setIsAuth }}>
			<div className='absolute top-4 left-4 bg-red-400 w-10 h-10 z-[100]'>{isAuth ? 'true' : 'false'}</div>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthContextProvider');
	}
	return context;
};

