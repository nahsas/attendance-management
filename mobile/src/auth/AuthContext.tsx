import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isWeb = typeof window !== 'undefined' && !window.navigator?.product;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isWeb) {
      loadStoredAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadStoredAuth = async () => {
    try {
      if (!AsyncStorage) {
        setIsLoading(false);
        return;
      }
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Failed to load auth (using session only):', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation ObtainToken($email: String!, $password: String!) {
              tokenAuth(email: $email, password: $password) {
                token
              }
            }
          `,
          variables: { email, password },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const authToken = data.data.tokenAuth.token;
      
      const userResponse = await fetch('http://localhost:8000/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken}`,
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                id
                email
                firstName
                lastName
                role
                school {
                  id
                  name
                }
              }
            }
          `,
        }),
      });

      const userData = await userResponse.json();
      const userInfo = userData.data.me;

      if (!isWeb && AsyncStorage) {
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('user', JSON.stringify(userInfo));
      }

      setToken(authToken);
      setUser(userInfo);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!isWeb && AsyncStorage) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      }
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
