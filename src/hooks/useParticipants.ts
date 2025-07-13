import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import type { Profile } from '@/types';
import { useLocalSearchParams } from 'expo-router';

type ParticipantRow = Profile & { role: string };

export default function useParticipants(onCountUpdate?: (n: number) => void) {
  const { user, authenticatedFetch } = useUser();
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { tripId } = useLocalSearchParams();

  const listParticipants = useCallback(async () => {
    if (!user || !tripId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/participants`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        const { error } = await res.json();
        console.error('Error fetching participants:', error);
        return;
      }

      const data = await res.json();
      setParticipants(data);
      onCountUpdate?.(data.length);
    } catch (err) {
      console.error('Participants error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authenticatedFetch, onCountUpdate, tripId]);

  useEffect(() => {
    if (user && tripId) {
      listParticipants();
    }
  }, [user, tripId, listParticipants]);

  return { participants, loading, listParticipants };
}
