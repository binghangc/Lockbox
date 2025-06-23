import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

export default function useTodayVibecheck(tripId: string) {
  const [vibecheck, setVibecheck] = useState<string | null>(null);
  const [vcloading, setVCLoading] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const fetchVibecheck = async () => {
      setVCLoading(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const today = dayjs().format('YYYY-MM-DD');

        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/vibecheck/${today}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Failed to fetch vibecheck');
        }

        setVibecheck(result.vibecheck);
      } catch (err) {
        console.error('Failed to fetch today’s vibecheck:', err.message);
      } finally {
        setVCLoading(false);
      }
    };

    fetchVibecheck();
  }, [tripId]);

  return { vibecheck, setVibecheck, vcloading };
}
