import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';

export default function useItineraries(tripId: string, tripDays: string[]) {
  const { user, authenticatedFetch } = useUser();
  const [dailyPlans, setDailyPlans] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (
      !tripId ||
      tripDays.length === 0 ||
      dailyPlans.length > 0 ||
      !user ||
      !authenticatedFetch
    )
      return;

    const fetchItineraries = async () => {
      try {
        const res = await authenticatedFetch(
          `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/itinerary`,
        );

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Failed to fetch itinerary');
        }

        interface ItineraryEntry {
          date: string;
          itinerary: string;
        }

        const itineraryMap = result.reduce(
          (acc: Record<string, string>, entry: ItineraryEntry) => {
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
        console.error(
          'Failed to preload itinerary:',
          err instanceof Error ? err.message : String(err),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [tripId, tripDays, dailyPlans, user, authenticatedFetch]);

  const submitItinerary = async (
    plans: string[],
    onSuccess: () => void,
    onError?: (message: string) => void,
  ) => {
    if (!user || !authenticatedFetch) {
      onError?.('Authentication required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = plans.map((plan, index) => ({
        trip_id: tripId,
        itinerary: plan,
        date: tripDays[index],
      }));

      const res = await authenticatedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/submit-itinerary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Itinerary submit error:', errorMessage);
      onError?.(errorMessage);
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
