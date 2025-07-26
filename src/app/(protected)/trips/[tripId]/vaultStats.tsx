import { useEffect, useState } from 'react';
import { Alert, View, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
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

  const saveVaultCard = async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } =
          await MediaLibrary.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission required',
            'We need media access to save the card!',
          );
          return;
        }
      }

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/vault/vault-card/${tripIdStr}`,
      );
      const { url } = await res.json();

      const fileUri = `${FileSystem.documentDirectory}${tripIdStr}-vault-card.png`;
      console.log('Vault card URL:', url);

      const downloadRes = await FileSystem.downloadAsync(url, fileUri);

      await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
      Alert.alert('Saved!', 'Vault card saved to gallery 📸');
    } catch (err) {
      console.error('Failed to save vault card:', err);
      Alert.alert('Error', 'Could not save image.');
    }
  };

  return (
    <TripThemeProvider videoKey={bgKey}>
      {tripIdStr && stats ? (
        <>
          <VaultStats stats={stats} trip={trip} />
          <FloatingButton icon="📷" onPress={saveVaultCard} />
        </>
      ) : (
        <View className="flex-1 items-center justify-center bg-black">
          <Text className="text-white">Loading trip stats...</Text>
        </View>
      )}
    </TripThemeProvider>
  );
}
