import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

const useVibeCheckStatus = (vibecheckId: string) => {
  const [status, setStatus] = useState(null);
  const { user, authenticatedFetch } = useUser();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!vibecheckId || !user) return;

      try {
        const res = await authenticatedFetch(
          `${process.env.EXPO_PUBLIC_API_URL}/vibecheck/${vibecheckId}/status?userId=${user.id}`,
        );
        const data = await res.json();
        setStatus(data.status);
      } catch (error) {
        console.error('Failed to fetch vibe check status:', error);
      }
    };

    fetchStatus();
  }, [vibecheckId, user, authenticatedFetch]);

  return status;
};

export default useVibeCheckStatus;
