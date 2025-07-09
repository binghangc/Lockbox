import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/UserContext';

export interface Trip {
  id: string;
  title: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  host?: { id: string; name: string; avatar_url: string };
  country?: string;
  description?: string;
  status?: string;
  is_pinned?: boolean;
  video_background?: string;
  // Add other trip fields as needed
}

export default function useTrips(tripId?: string) {
  const { user } = useUser();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTrip = useCallback(async () => {
    if (!tripId || !user) return;

    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (res.ok) {
        setTrip(data);
        setIsHost(data.is_host ?? false);
      }
    } catch (err) {
      console.error('Fetch trip error:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const isPinned = trip?.is_pinned ?? false;

  return { trip, isHost, loading, isPinned, refreshTrip: fetchTrip };
}
