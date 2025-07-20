/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VibeCheckStatus = {
  userHasResponded: boolean;
  orbId: string | null;
  submittedAt: string | null;
  anyoneHasResponded: boolean;
};

const useVibeCheckStatus = (vibecheckId: string) => {
  const [status, setStatus] = useState<VibeCheckStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!vibecheckId || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('access_token');

        // Use the existing orbs endpoint to determine status
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/orbs/vibecheck/${vibecheckId}/orbs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const text = await res.text();
        console.log('Raw vibecheck status response:', text);

        let json;
        try {
          json = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse failed for vibecheck status:', parseError);
          setError(new Error('Server returned invalid JSON'));
          return;
        }

        if (res.ok) {
          const orbs = json.orbs || [];

          // Check if current user has responded
          const userHasResponded = orbs.some(
            (orb: any) => orb.user_id === user.id,
          );

          // Check if anyone has responded
          const anyoneHasResponded = orbs.length > 0;

          // Find user's orb if exists
          const userOrb = orbs.find((orb: any) => orb.user_id === user.id);

          const statusData: VibeCheckStatus = {
            userHasResponded,
            orbId: userOrb?.id || null,
            submittedAt: userOrb?.created_at || null,
            anyoneHasResponded,
          };

          setStatus(statusData);
          setError(null);
        } else {
          console.error('API error:', json);
          setError(new Error(json.error || 'Failed to fetch vibecheck status'));
        }
      } catch (err) {
        console.error('Network error fetching vibecheck status:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [vibecheckId, user]);

  return { status, loading, error };
};

export default useVibeCheckStatus;
