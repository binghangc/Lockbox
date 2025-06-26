import { useState, useMemo } from 'react';
import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/types';

export type SearchResult = Profile & {
  status: 'accepted' | 'pending' | 'incoming' | 'none';
};

export default function useFriendSearch(currentUserId: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearchUsers = async (username: string) => {
    if (!username || username.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/friends/search?username=${username}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data ?? []);
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  const debouncedSearch = useMemo(() => debounce(handleSearchUsers, 300), []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/friends/send-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid1: currentUserId,
            uid2: targetUserId,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      setResults((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, status: 'pending' } : u,
        ),
      );
    } catch (err) {
      console.error('Friend request error:', err);
    }
  };

  return {
    query,
    results,
    loading,
    handleQueryChange,
    sendFriendRequest,
  };
}
