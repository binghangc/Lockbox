import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/components/UserContext';

export interface Trip {
  id: string;
  title: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  host?: { id: string; name: string; avatar_url: string };
  country?: string;
  description?: string;
  // Add other trip fields as needed
}

export default function useTrips(tripId?: string) {
  const { user } = useUser();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId || !user) {
      setLoading(false);
      return () => {}; // return empty cleanup function to satisfy ESLint
    }
    let cancelled = false;

    async function loadTrip() {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!cancelled && res.ok) {
          setTrip(data);
          setIsHost(data.is_host ?? false);
        }
      } catch (err) {
        if (!cancelled) console.error('Fetch trip error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTrip();
    return () => {
      cancelled = true;
    };
  }, [tripId, user]);

  return { trip, isHost, loading };
}
