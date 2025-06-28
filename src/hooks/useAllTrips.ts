import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trip } from '@/types';
import { useUser } from '@/components/UserContext';
import { useFocusEffect } from '@react-navigation/native';

type TripWithPin = Trip & {
  is_pinned?: boolean;
};

export default function useAllTrips() {
  const { user } = useUser();
  const [trips, setTrips] = useState<TripWithPin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  }, []);

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
