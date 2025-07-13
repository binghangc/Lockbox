import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import dayjs from 'dayjs';

export default function useTodayVibecheck(
  tripId: string,
  tripStatus: 'upcoming' | 'ongoing' | 'ended',
) {
  const { user, authenticatedFetch } = useUser();
  const [vibecheck, setVibecheck] = useState<string | null>(null);
  const [vibecheckId, setVibecheckId] = useState<string | null>(null);
  const [vcloading, setLoading] = useState(true);

  const today = dayjs().format('YYYY-MM-DD');

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
    if (!user) return;

    setLoading(true);
    try {
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/vibecheck/${today}`,
        {
          method: 'PATCH',
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
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
