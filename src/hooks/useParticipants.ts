import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile } from '@/types';
import { useLocalSearchParams } from 'expo-router';

type ParticipantRow = Profile & { role: string };

export default function useParticipants(onCountUpdate?: (n: number) => void) {
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { tripId } = useLocalSearchParams();

  const listParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/participants`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
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
    } catch {
      console.error('Participants error:', 'failed to retrieve participants');
    } finally {
      setLoading(false);
    }
  }, [onCountUpdate, tripId]);

  useEffect(() => {
    listParticipants();
  }, [listParticipants]);

  return { participants, loading, listParticipants };
}
