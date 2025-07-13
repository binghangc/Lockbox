import { useState, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import { useUser } from '@/context/UserContext';
import { Profile } from '@/types';

export type SearchResult = Profile & {
  status: 'accepted' | 'pending' | 'incoming' | 'none';
};

export default function useFriendSearch(currentUserId: string) {
  const { user, authenticatedFetch } = useUser();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearchUsers = useCallback(
    async (username: string) => {
      if (!username || username.length < 2 || !user) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await authenticatedFetch(
          `${process.env.EXPO_PUBLIC_API_URL}/friends/search?username=${username}`,
          {
            headers: {
              'Content-Type': 'application/json',
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
    },
    [user, authenticatedFetch],
  );

  const debouncedSearch = useMemo(
    () => debounce(handleSearchUsers, 300),
    [handleSearchUsers],
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/friends/send-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
