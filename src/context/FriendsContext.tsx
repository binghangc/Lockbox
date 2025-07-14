import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/types';

type FriendsContextType = {
  friends: Profile[];
  loading: boolean;
  refreshFriends: () => Promise<void>;
};

const FriendsContext = createContext<FriendsContextType | null>(null);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('[FriendsProvider] mounted');

  const refreshFriends = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    console.log('[refreshFriends] triggered');
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log('[refreshFriends] received:', data);
    setFriends(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('[FriendsProvider] useEffect running');
    refreshFriends();
  }, [refreshFriends]);

  const contextValue = React.useMemo(
    () => ({ friends, loading, refreshFriends }),
    [friends, loading, refreshFriends],
  );

  return (
    <FriendsContext.Provider value={contextValue}>
      {children}
    </FriendsContext.Provider>
  );
}

export const useFriendsContext = () => {
  const ctx = useContext(FriendsContext);
  if (!ctx)
    throw new Error('useFriendsContext must be used within FriendsProvider');
  return ctx;
};
