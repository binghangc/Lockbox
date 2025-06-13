import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

import type { Profile } from '@/types';

type FriendRow = Profile & { friendshipId: string };

export default function useFriends(onCountUpdate?: (n: number) => void) {
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);

  const listFriends = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const { error } = await res.json();
        console.error('Error fetching friends:', error);
        return;
      }

      const data = await res.json();
      setFriends(data);
      onCountUpdate?.(data.length);
    } catch {
      console.error('Friends error:', 'failed to retrieve friends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listFriends();
  }, [listFriends]);

  useEffect(() => {
    if (!loading) {
      onCountUpdate?.(friends.length);
    }
  }, [friends.length, loading, onCountUpdate]);

  return { friends, loading, listFriends };
}
