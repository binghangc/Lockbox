import { router } from 'expo-router';
import type { Profile } from '@/types';
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
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
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      if (!storedRefreshToken) return null;

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: storedRefreshToken }),
        },
      );

      const result = await res.json();
      if (res.ok && result.session) {
        await AsyncStorage.setItem('access_token', result.session.access_token);
        await AsyncStorage.setItem(
          'refresh_token',
          result.session.refresh_token,
        );
        setToken(result.session.access_token);
        return result.session.access_token;
      }

      // Refresh failed, clear tokens
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      setToken(null);
      setUser(null);
      return null;
    } catch (err) {
      console.error('Token refresh error:', err);
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  const fetchUserWithToken = async (accessToken: string) => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // If token is expired (401), try to refresh
      if (res.status === 401) {
        console.log('Token expired, attempting refresh...');
        const newToken = await refreshToken();
        if (newToken) {
          // Retry with new token
          const retryRes = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/profile`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            },
          );
          const retryResult = await retryRes.json();
          if (retryRes.ok && retryResult.profile) {
            console.log('Successfully refreshed token and fetched profile');
            setUser(retryResult.profile);
            return;
          }
        }
        // If refresh failed, clear everything but don't call logout (prevents recursion)
        console.log('Token refresh failed, clearing auth state');
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        setToken(null);
        setUser(null);
        return;
      }

      const result = await res.json();
      if (res.ok && result.profile) {
        console.log(
          'Successfully fetched user profile:',
          result.profile.username,
        );
        setUser(result.profile);
        // Make sure token state is set correctly
        setToken(accessToken);
      } else {
        console.warn(
          '[UserContext] Invalid token or no profile:',
          result.error,
        );
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const storedToken = await AsyncStorage.getItem('access_token');
        const storedRefreshToken = await AsyncStorage.getItem('refresh_token');

        if (!storedToken) {
          console.log('No stored token found');
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        console.log('Found stored token, fetching user profile...');
        console.log('Access token exists:', !!storedToken);
        console.log('Refresh token exists:', !!storedRefreshToken);

        await fetchUserWithToken(storedToken);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    } catch (e) {
      console.error('Error clearing tokens:', e);
    } finally {
      setUser(null);
      setToken(null);
      router.replace('/(auth)');
    }
  }, []);

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

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) {
        throw new Error('No authentication token available');
      }

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      let response = await fetch(url, { ...options, headers });

      // If token expired, try to refresh and retry
      if (response.status === 401) {
        console.log(
          'Token expired in authenticatedFetch, attempting refresh...',
        );
        const newToken = await refreshToken();
        if (newToken) {
          // Retry with new token
          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          };
          response = await fetch(url, { ...options, headers: newHeaders });
        } else {
          // Refresh failed, clear auth state
          await logout();
          throw new Error('Authentication failed');
        }
      }

      return response;
    },
    [token, refreshToken, logout],
  );

  const updateEmail = useCallback(
    async (newEmail: string) => {
      if (!token) {
        throw new Error('No authentication token available');
      }

      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/update-email`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: newEmail }),
          },
        );

        const result = await res.json();
        if (!res.ok) {
          return { success: false, message: result.message };
        }
        // Optionally update user state
        setUser((prev) => (prev ? { ...prev, email: newEmail } : prev));

        return {
          success: true,
          message: result.message,
          email_change: result.email_change || null,
        };
      } catch (err) {
        console.error('Error updating email:', err);
        return {
          success: false,
          message: 'Unexpected error occurred while updating email.',
        };
      }
    },
    [token],
  );

  const updatePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      confirmPassword: string,
    ) => {
      if (!token) {
        throw new Error('No authentication token available');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('New password and confirm password do not match');
      }

      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/update-password`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          },
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'Failed to update password');
        }

        console.log('Password updated successfully');
      } catch (err) {
        console.error('Error updating password:', err);
      }
    },
    [token],
  );

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
      authenticatedFetch,
      updateEmail,
      updatePassword,
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
      authenticatedFetch,
      updateEmail,
      updatePassword,
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
