import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useUser } from '@/context/UserContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function useTodayVibecheck(
  tripId: string,
  tripStatus: 'upcoming' | 'ongoing' | 'ended',
) {
  const { user, authenticatedFetch } = useUser();
  const [vibecheck, setVibecheck] = useState<string | null>(null);
  const [vibecheckId, setVibecheckId] = useState<string | null>(null);
  const [vcloading, setLoading] = useState(true);

  const today = dayjs(new Date()).format('YYYY-MM-DD');

  console.log('Today:', today);

  const fetchVibecheck = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/vibecheck/${today}`,
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setVibecheck(result.vibecheck);
      setVibecheckId(result.vibecheck_id);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error fetching vibecheck:', err.message);
      } else {
        console.error('Error fetching vibecheck:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, today, user, authenticatedFetch]);

  const reshuffleVibecheck = async () => {
    if (!user || !vibecheckId) return;

    setLoading(true);
    try {
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/vibecheck/${today}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vibecheck_id: vibecheckId }),
        },
      );
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      if (result.reshuffleAllowed === false) {
        Alert.alert(
          'Reshuffle Blocked',
          result.message || 'Orbs already exist.',
        );
        return;
      }

      setVibecheck(result.vibecheck);
      setVibecheckId(result.vibecheck_id);
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
      setVibecheckId(null);
      setLoading(false);
      return;
    }

    if (user) {
      fetchVibecheck();
    }
  }, [tripStatus, user, fetchVibecheck]);

  return { vibecheck, vibecheckId, vcloading, reshuffleVibecheck };
}
