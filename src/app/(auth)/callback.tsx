'use client';

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth error:', error);
        return;
      }

      // Optional: fetch user details, update UI, etc.
      router.replace('/(tabs)');
    };

    handleAuth();
  }, [router]);

  return <p className="text-white">Verifying...</p>;
}
