import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { Profile, Role } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const tripDirtyMap = new Map<string, boolean>();

export const markTripDirty = (id: string) => tripDirtyMap.set(id, true);
export const isTripDirty = (id: string) => tripDirtyMap.get(id) === true;
export const clearTripDirty = (id: string) => tripDirtyMap.set(id, false);

export interface Trip {
  id: string;
  title: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  host: Profile;
  country?: string;
  description?: string;
  status?: string;
  is_pinned?: boolean;
  video_background?: string;
  effects?: string;
  tags?: string[];
  created_at: string;
  user_id: string;
  participants: { profile: Profile; role: Role }[];
  is_host: boolean;
}

export default function useTrips(tripId?: string) {
  const { user, authenticatedFetch } = useUser();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();

  const fetchTrip = useCallback(async () => {
    if (!tripId || !user || !authenticatedFetch) {
      setLoading(false);
      return;
    }

    try {
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}`,
      );
      const data = await res.json();
      if (res.ok) {
        setTrip(data);
        setIsHost(data.is_host ?? false);
      } else {
        console.error('Fetch trip error:', data.error);
      }
    } catch (err) {
      console.error('Fetch trip error:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId, user, authenticatedFetch]);

  useEffect(() => {
    if (user && tripId) {
      fetchTrip();
    }
  }, [user, tripId, fetchTrip, params.refresh]); // Add params.refresh to dependencies

  // Also refetch when the screen comes into focus (for navigation back)
  useFocusEffect(
    useCallback(() => {
      if (user && tripId && isTripDirty(tripId)) {
        fetchTrip();
        clearTripDirty(tripId);
      }
    }, [user, tripId, fetchTrip]),
  );

  const isPinned = trip?.is_pinned ?? false;

  return { trip, isHost, loading, isPinned, refreshTrip: fetchTrip };
}
