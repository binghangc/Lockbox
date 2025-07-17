import { useEffect, useState } from 'react';

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
    if (!vibecheckId) return;

    const fetchOrbs = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/orbs/vibecheck/${vibecheckId}/orbs`,
        );
        const json = await res.json();
        setOrbs(json.orbs || []);
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
