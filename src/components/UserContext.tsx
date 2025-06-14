import type { Profile } from '@/types';
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  user: Profile | null;
  setUser: React.Dispatch<React.SetStateAction<Profile | null>>;
  loading: boolean;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
  deleteAccount: () => void;
  deleting: boolean;
  setDeleting: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = await AsyncStorage.getItem('access_token');
      setToken(storedToken);
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
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

  const logout = React.useCallback(async () => {
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (e) {
      console.error('Error clearing token:', e);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, [setUser, setToken]);

  const deleteAccount = React.useCallback(async () => {
    setDeleting(true);
    try {
      // Call backend delete endpoint
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/delete`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
      );
      // Log status and raw body for debugging
      const text = await res.text();
      console.log('[DELETE /auth/delete] status=', res.status, 'body=', text);
      if (!res.ok) {
        // Try to parse JSON error, fallback to raw text
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { message: text };
        }
        throw new Error(parsed.message || 'Account deletion failed');
      }

      console.log('Account deleted');
    } catch (err) {
      console.error('Error deleting account:', err);
    } finally {
      await logout();
      setDeleting(false);
    }
  }, [token, logout]);

  const contextValue = React.useMemo(
    () => ({
      user,
      setUser,
      loading,
      token,
      setToken,
      logout,
      deleteAccount,
      deleting,
      setDeleting,
    }),
    [
      user,
      loading,
      token,
      setUser,
      setToken,
      logout,
      deleteAccount,
      deleting,
      setDeleting,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
