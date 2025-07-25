import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@/context/UserContext'; // Adjust path if needed
import AuthLayout from './(auth)';
import ProtectedLayout from './(protected)/(tabs)';

export default function App() {
  const { user, loading } = useUser();

  if (loading) return null; // You can render a splash screen here if desired

  return (
    <>
      {/* Set status bar background + icon style */}
      <StatusBar
        style={{ color: 'light' }}
        backgroundColor="#000"
        translucent={false}
      />
      {user ? <ProtectedLayout /> : <AuthLayout />}
    </>
  );
}
