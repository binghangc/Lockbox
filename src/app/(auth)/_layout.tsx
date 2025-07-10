import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useUser } from '@/context/UserContext';

export default function AuthLayout() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is authenticated, redirect to main app
      router.replace('/(tabs)');
    }
  }, [user, loading, router]);

  // Don't render anything while loading or if user is authenticated
  if (loading || user) {
    return null;
  }

  return <Slot />;
}
