import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useLocalSearchParams } from 'expo-router';
import { Profile } from '@/types';

export interface ParticipantData {
  user_id: string;
  profile: Profile;
  role?: string;
}

export default function useParticipants(
  onCountUpdate?: (count: number) => void,
) {
  const { user, authenticatedFetch } = useUser();
  const { tripId } = useLocalSearchParams();
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    if (!tripId || !user || !authenticatedFetch) {
      setLoading(false);
      return;
    }

    try {
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/participants`,
      );
      const data = await res.json();

      if (res.ok) {
        setParticipants(data || []);
        onCountUpdate?.(data?.length || 0);
      } else {
        console.error(
          '[useParticipants] Fetch participants error:',
          data.error,
        );
        setParticipants([]);
        onCountUpdate?.(0);
      }
    } catch (err) {
      console.error('[useParticipants] Fetch participants error:', err);
      setParticipants([]);
      onCountUpdate?.(0);
    } finally {
      setLoading(false);
    }
  }, [tripId, user, authenticatedFetch, onCountUpdate]);

  useEffect(() => {
    if (user && tripId) {
      fetchParticipants();
    }
  }, [user, tripId, fetchParticipants]);

  return { participants, loading, fetchParticipants };
}
