import { useEffect, useRef, useState } from 'react';
import { Alert, View, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import { TripThemeProvider } from '@/context/TripThemeProvider';
import useTrips from '@/hooks/useTrips';
import FloatingButton from '@/components/vault/floatingButton';
import VaultStats from '@/components/vault/vaultStats';

export default function VaultStatsScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);
  const bgKey = trip?.video_background || 'moonlight';
  const viewShotRef = useRef(null);
  const [readyToCapture, setReadyToCapture] = useState(false);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripIdStr}/vault/stats`,
        );
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch trip stats:', err.message);
      }
    };
    loadStats();
  }, [tripIdStr]);

  const takeScreenshot = async () => {
    if (!readyToCapture) {
      console.warn('Not ready to capture yet');
      return;
    }
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } =
        await MediaLibrary.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('We need access to your media library to save images!');
        return;
      }
    }

    try {
      const uri = await viewShotRef.current?.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      console.log('Saved to gallery:', uri);
    } catch (e) {
      console.error('Screenshot failed:', e);
    }
  };

  return (
    <TripThemeProvider videoKey={bgKey}>
      {tripIdStr && stats ? (
        <>
          <VaultStats
            stats={stats}
            trip={trip}
            onLayoutFinished={() => setReadyToCapture(true)}
          />
          <FloatingButton icon="📷" onPress={takeScreenshot} />
        </>
      ) : (
        <View className="flex-1 items-center justify-center bg-black">
          <Text className="text-white">Loading trip stats...</Text>
        </View>
      )}
    </TripThemeProvider>
  );
}
