import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripThemeProvider, useTripTheme } from '@/context/TripThemeProvider';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import useTrips from '@/hooks/useTrips';
import { useState } from 'react';
import VibeCarousel from '@/components/vault/vibeCarousel';
import ResponseFeed from '@/components/vault/responseFeed';
import FloatingButton from '@/components/vault/floatingButton';

function VaultContent({ tripId }: { tripId: string }) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const [selectedVibeId, setSelectedVibeId] = useState<string | null>(null);

  const { trip } = useTrips(tripId);
  const bgKey = trip?.video_background ?? null;
  const router = useRouter();

  const onPress = () => router.push(`/trips/${tripId}/vaultStats`);

  console.log('Vault ID (centered):', selectedVibeId);

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: 'Vault',
          headerTitleStyle: {
            color: theme.primaryText,
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackground: () => (
            <BlurView
              intensity={60}
              tint={theme.blurTint as 'light' | 'dark' | 'default'}
              experimentalBlurMethod="none"
              style={{
                flex: 1,
                backgroundColor:
                  Platform.OS === 'android'
                    ? `${theme.secondaryBackground}EE`
                    : undefined,
              }}
            />
          ),
        }}
      />

      <TripVisualBackground videoKey={bgKey} effectKey={null} />

      <View style={{ flex: 1 }}>
        <View
          className="flex-1 pt-6"
          style={{
            paddingTop: insets.top + 60,
            backgroundColor: 'transparent',
          }}
        >
          <View style={{ flex: 1 }}>
            <VibeCarousel
              tripId={tripId}
              selectedVibeId={selectedVibeId}
              onSelect={setSelectedVibeId}
            />
            {selectedVibeId && (
              <ResponseFeed
                vibecheckId={selectedVibeId}
                style={{ marginTop: 16 }}
              />
            )}
          </View>
        </View>

        {/* Floating Button */}
        <FloatingButton icon="⏳" onPress={onPress} />
      </View>
    </>
  );
}

export default function VaultScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);
  const bgKey = trip?.video_background ?? null;

  return (
    <TripThemeProvider videoKey={bgKey ?? 'moonlight'}>
      {tripIdStr && <VaultContent tripId={tripIdStr} />}
    </TripThemeProvider>
  );
}
