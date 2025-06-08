

import React from 'react';
import { useUser } from '@/components/UserContext'; // Adjust path if needed
import AuthLayout from './(auth)';
import ProtectedLayout from './(protected)/(tabs)';

export default function App() {
  const { user, loading } = useUser();

  if (loading) return null; // You can render a splash screen here if desired

  return user ? <ProtectedLayout /> : <AuthLayout />;
}