import { useEffect, useState, useCallback } from 'react';
import type { Trip } from '@/types';
import { useUser } from '@/context/UserContext';
import { useFocusEffect } from '@react-navigation/native';

type TripWithPin = Trip & {
  is_pinned?: boolean;
};

export default function useAllTrips() {
  const { user, authenticatedFetch } = useUser();
  const [trips, setTrips] = useState<TripWithPin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips`,
      );
      const data = await res.json();

      if (res.ok) {
        setTrips(data);
      } else {
        console.error('Trip fetch error:', data.error);
      }
    } catch (err) {
      console.error('Trip fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authenticatedFetch]);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchTrips();
    }, [user, fetchTrips]),
  );

  useEffect(() => {
    if (user) fetchTrips();
  }, [user, fetchTrips]);

  return { trips, loading, refreshTrips: fetchTrips, setTrips };
}
