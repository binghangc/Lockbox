import { View, Platform, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TripThemeProvider, useTripTheme } from '@/context/TripThemeProvider';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import useTrips from '@/hooks/useTrips';
import { useState } from 'react';
import VibeCarousel from '@/components/vault/vibeCarousel';
import ResponseFeed from '@/components/vault/responseFeed';

function VaultContent({ tripId }: { tripId: string }) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const [selectedVibeId, setSelectedVibeId] = useState<string | null>(null);

  const { trip } = useTrips(tripId);
  const bgKey = trip?.video_background ?? null;
  const router = useRouter();

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
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + 24,
            right: 24,
            zIndex: 1000,
            elevation: 12,
          }}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={() => router.push(`/trips/${tripId}/vaultStats`)}
            style={{ zIndex: 1001 }}
          >
            <LinearGradient
              colors={theme.mainBubbleGradient}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.8 }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.primaryOutline,
              }}
            >
              <Text>⏳</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
