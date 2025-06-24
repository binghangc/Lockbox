import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

export default function useTodayVibecheck(
  tripId: string,
  tripStatus: 'upcoming' | 'ongoing' | 'ended',
) {
  const [vibecheck, setVibecheck] = useState<string | null>(null);
  const [vcloading, setLoading] = useState(true);

  const today = dayjs().format('YYYY-MM-DD');

  const fetchVibecheck = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/vibecheck/${today}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setVibecheck(result.vibecheck);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error fetching vibecheck:', err.message);
      } else {
        console.error('Error fetching vibecheck:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, today]);

  const reshuffleVibecheck = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/vibecheck/${today}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setVibecheck(result.vibecheck);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Shuffle failed:', err.message);
      } else {
        console.error('Shuffle failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripStatus !== 'ongoing') {
      setVibecheck(null);
      setLoading(false);
      return;
    }

    fetchVibecheck();
  }, [tripStatus, fetchVibecheck]);

  return { vibecheck, vcloading, reshuffleVibecheck };
}
