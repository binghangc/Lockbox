import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Orb {
  id: string;
  user_id: string;
  trip_id: string;
  hls_key: string;
  created_at: string;
  hlsUrl: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

export default function useOrbsByVibecheck(vibecheckId: string) {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vibecheckId) {
      setLoading(false);
      return;
    }

    const fetchOrbs = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/orbs/vibecheck/${vibecheckId}/orbs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const text = await res.text();
        console.log('Raw orbs response:', text);

        let json;
        try {
          json = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse failed:', parseError);
          return;
        }

        if (res.ok) {
          const mappedOrbs = (json.orbs || []).map((orb: Orb) => ({
            ...orb,
            hlsUrl: orb.hlsUrl,
          }));

          console.log('Mapped orbs with HLS URLs:', mappedOrbs);
          setOrbs(mappedOrbs);
        } else {
          console.error('Failed to fetch orbs:', json.error);
        }
      } catch (err) {
        console.error('Failed to fetch orbs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrbs();
  }, [vibecheckId]);

  return { orbs, loading };
}
