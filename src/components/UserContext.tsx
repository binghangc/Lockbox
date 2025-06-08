import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
  deleteAccount: () => void;
};

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setToken(token);
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.profile) {
          setUser(result.profile);
        } else {
          console.warn(
            '[UserContext] Invalid token or no profile:',
            result.error,
          );
          await AsyncStorage.removeItem('access_token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        await AsyncStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (e) {
      console.error('Error clearing token:', e);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/delete`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Account deletion failed');
      }

      console.log('Account deleted');
    } catch (err) {
      console.error('Error deleting account:', err);
    } finally {
      await logout();
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, token, setToken, logout, deleteAccount }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
