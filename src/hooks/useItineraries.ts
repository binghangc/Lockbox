import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useItineraries(tripId: string, tripDays: string[]) {
  const [dailyPlans, setDailyPlans] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!tripId || tripDays.length === 0 || dailyPlans.length > 0) return;

    const fetchItineraries = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/itinerary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Failed to fetch itinerary');
        }

        const itineraryMap = result.reduce(
          (acc, entry) => {
            acc[entry.date] = entry.itinerary;
            return acc;
          },
          {} as Record<string, string>,
        );

        const filledPlans = tripDays.map((date) => itineraryMap[date] || '');
        setDailyPlans(filledPlans);
        setIsEditing(filledPlans.some((plan) => plan.trim().length > 0));
        hasFetched.current = true;
      } catch (err) {
        console.error('Failed to preload itinerary:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [tripId, tripDays]);

  const submitItinerary = async (
    plans: string[],
    onSuccess: () => void,
    onError?: (message: string) => void,
  ) => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('access_token');
      const payload = plans.map((plan, index) => ({
        trip_id: tripId,
        itinerary: plan,
        date: tripDays[index],
      }));

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/submit-itinerary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await res.json();
      console.log('API response:', result);

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit itinerary');
      }

      onSuccess?.();
    } catch (err) {
      console.error('Itinerary submit error:', err.message);
      onError?.(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasItinerary = dailyPlans.some((plan) => plan.trim().length > 0);

  return {
    dailyPlans,
    setDailyPlans,
    isEditing,
    loading,
    isSubmitting,
    submitItinerary,
    hasItinerary,
  };
}
