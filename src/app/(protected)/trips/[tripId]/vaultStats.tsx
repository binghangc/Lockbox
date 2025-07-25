import { View, Text, ScrollView, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { TripThemeProvider, useTripTheme } from '@/context/TripThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import FloatingButton from '@/components/vault/floatingButton';
import useTrips from '@/hooks/useTrips';
import { THEME_CONFIG, VIBE_CLUSTER_CONFIG } from '@/constants/statsConfig';

interface TripStats {
  trip_id: string;
  overall_vibe: string;
  theme_distribution: Record<string, number>;
  top_activity_tags: string[];
  top_location_tags: string[];
  top_keywords: string[];
  vibe_clusters: Record<string, string[]>;
  highlight_day: {
    date: string;
    orb_count: number;
    vibe: string;
  } | null;
  trip_archetype: string;
}

function VaultStats() {
  const theme = useTripTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<TripStats | null>(null);
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/vault/stats`,
        );
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch trip stats:', err.message);
      }
    };
    load();
  }, [tripId]);

  console.log(stats);

  if (!stats) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.primaryBackground }}
      >
        <Text style={{ color: theme.primaryText }}>Loading trip stats...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <TripVisualBackground
        videoKey={trip?.video_background ?? 'moonlight'}
        effectKey={trip?.effects ?? null}
        // eslint-disable-next-line react/jsx-boolean-value
        screenshotMode={true}
      />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-3xl font-bold mb-2"
          style={{ color: theme.primaryText }}
        >
          {stats.trip_archetype}
        </Text>

        <Text
          className="text-xl italic mb-6"
          style={{ color: theme.secondaryText }}
        >
          Your overall vibe this trip
        </Text>

        <Text
          className="text-2xl font-bold mb-2"
          style={{ color: theme.primaryText }}
        >
          Top Themes
        </Text>
        <View className="flex-row flex-wrap gap-4 mb-6">
          {[...Object.entries(stats.theme_distribution)]
            .sort(([, a], [, b]) => b - a)
            .map(([themeKey, count]) => {
              const config = THEME_CONFIG[themeKey as ThemeKey];
              if (!config) return null;

              return (
                <View key={themeKey} className="items-center w-24">
                  <Text className="text-6xl">{config.emoji}</Text>
                  <Text
                    className="text-m text-center mt-1"
                    style={{ color: theme.secondaryText }}
                  >
                    {config.label}
                    {'\n'}
                    {count}
                  </Text>
                </View>
              );
            })}
        </View>

        {stats.top_activity_tags?.length > 0 && (
          <>
            <Text
              className="text-2xl font-bold mb-2"
              style={{ color: theme.primaryText }}
            >
              Top Activities
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {stats.top_activity_tags.map((tag) => (
                <Text
                  key={tag}
                  className="bg-white/20 px-3 py-1 rounded-full"
                  style={{ color: theme.secondaryText }}
                >
                  {tag}
                </Text>
              ))}
            </View>
          </>
        )}

        {stats.top_location_tags?.length > 0 && (
          <>
            <Text
              className="text-2xl font-bold mb-2"
              style={{ color: theme.primaryText }}
            >
              Top Locations
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {stats.top_location_tags.map((tag) => (
                <Text
                  key={tag}
                  className="bg-white/20 px-3 py-1 rounded-full"
                  style={{ color: theme.secondaryText }}
                >
                  {tag}
                </Text>
              ))}
            </View>
          </>
        )}

        <Text
          className="text-2xl font-bold mb-2"
          style={{ color: theme.primaryText }}
        >
          Top Keywords
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {stats.top_keywords.map((word) => (
            <Text
              key={word}
              className="bg-white/20 px-3 py-1 rounded-full"
              style={{ color: theme.secondaryText }}
            >
              {word}
            </Text>
          ))}
        </View>

        {stats.highlight_day && (
          <View className="mb-6">
            <Text
              className="text-2xl font-bold mb-2"
              style={{ color: theme.primaryText }}
            >
              Highlight Day
            </Text>
            <Text className="text-white">
              {stats.highlight_day.date}: &quot;{stats.highlight_day.vibe}
              &quot; — {stats.highlight_day.orb_count} orb
              {stats.highlight_day.orb_count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <Text
          className="text-2xl font-bold mb-2"
          style={{ color: theme.primaryText }}
        >
          Vibe Clusters
        </Text>
        <View className="gap-4">
          {Array.isArray(stats.vibe_clusters) &&
            stats.vibe_clusters.map((clusterName, _) => {
              const config = VIBE_CLUSTER_CONFIG[clusterName] ?? {
                emoji: '🌀',
                tagline: 'Undefined vibes, but definitely something.',
                glowColor: '#a1a1aa',
              };

              return (
                <View
                  key={clusterName}
                  className="w-full mb-4"
                  style={{
                    shadowColor: config.glowColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    elevation: 12,
                  }}
                >
                  <Text
                    className="text-xl font-bold mb-1"
                    style={{ color: theme.secondaryText }}
                  >
                    {config.emoji} {clusterName}
                  </Text>
                  <Text
                    className="text-m italic"
                    style={{ color: theme.secondaryText }}
                  >
                    {config.tagline}
                  </Text>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

export default function VaultStatsScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);
  const bgKey = trip?.video_background || 'moonlight';

  const viewShotRef = useRef(null);

  const takeScreenshot = async () => {
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
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      console.log('Saved to gallery:', uri);
    } catch (e) {
      console.error('Screenshot failed:', e);
    }
  };

  return (
    <TripThemeProvider videoKey={bgKey}>
      {tripIdStr && (
        <>
          <VaultStats tripId={tripIdStr} />

          <FloatingButton icon="📷" onPress={takeScreenshot} />
        </>
      )}
    </TripThemeProvider>
  );
}
