import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';

import type { Profile } from '@/types';

type FriendRow = Profile & { friendshipId: string };

export default function useFriends(onCountUpdate?: (n: number) => void) {
  const { user, authenticatedFetch } = useUser();
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);

  const listFriends = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/friends`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        const { error } = await res.json();
        console.error('Error fetching friends:', error);
        return;
      }

      const data = await res.json();
      setFriends(data);
      onCountUpdate?.(data.length);
    } catch (err) {
      console.error('Friends error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authenticatedFetch, onCountUpdate]);

  useEffect(() => {
    if (user) {
      listFriends();
    } else {
      setLoading(false);
    }
  }, [user, listFriends]);

  return { friends, loading, listFriends };
}
