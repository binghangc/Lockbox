import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

export default function useTodayVibecheck(tripId: string) {
  const [vibecheck, setVibecheck] = useState<string | null>(null);
  const [vcloading, setLoading] = useState(true);

  const today = dayjs().format('YYYY-MM-DD');

  const fetchVibecheck = async () => {
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
      console.error('Error fetching vibecheck:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const reshuffleVibecheck = async () => {
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
      console.error('Shuffle failed:', err.message);
    }
  };

  useEffect(() => {
    fetchVibecheck();
  }, [tripId]);

  return { vibecheck, vcloading, reshuffleVibecheck };
}
