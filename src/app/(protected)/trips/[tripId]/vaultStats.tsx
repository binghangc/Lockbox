import { View, Text, ScrollView } from 'react-native';
import { TripThemeProvider, useTripTheme } from '@/context/TripThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import useTrips from '@/hooks/useTrips';

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
  console.log('meow');

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
    <>
      <TripVisualBackground
        videoKey={theme.videoKey ?? 'moonlight'}
        effectKey={trip?.effects ?? null}
      />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
      >
        <Text className="text-2xl font-bold text-white mb-2">
          Trip Archetype
        </Text>
        <Text className="text-lg text-white mb-6">{stats.trip_archetype}</Text>

        <Text className="text-2xl font-bold text-white mb-2">Top Themes</Text>
        <View className="mb-6">
          {Object.entries(stats.theme_distribution).map(([t, count]) => (
            <Text key={t} className="text-white">
              {t}: {count}
            </Text>
          ))}
        </View>

        {stats.top_activity_tags?.length > 0 && (
          <>
            <Text className="text-2xl font-bold text-white mb-2">
              Top Activities
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {stats.top_activity_tags.map((tag) => (
                <Text
                  key={tag}
                  className="bg-white/20 text-white px-3 py-1 rounded-full"
                >
                  {tag}
                </Text>
              ))}
            </View>
          </>
        )}

        {stats.top_location_tags?.length > 0 && (
          <>
            <Text className="text-2xl font-bold text-white mb-2">
              Top Locations
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {stats.top_location_tags.map((tag) => (
                <Text
                  key={tag}
                  className="bg-white/20 text-white px-3 py-1 rounded-full"
                >
                  {tag}
                </Text>
              ))}
            </View>
          </>
        )}

        <Text className="text-2xl font-bold text-white mb-2">Top Keywords</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {stats.top_keywords.map((word) => (
            <Text
              key={word}
              className="bg-white/20 text-white px-3 py-1 rounded-full"
            >
              {word}
            </Text>
          ))}
        </View>

        {stats.highlight_day && (
          <View className="mb-6">
            <Text className="text-2xl font-bold text-white mb-2">
              Highlight Day
            </Text>
            <Text className="text-white">
              {stats.highlight_day.date}: &quot;{stats.highlight_day.vibe}&quot;
              — {stats.highlight_day.orb_count} orb
              {stats.highlight_day.orb_count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <Text className="text-2xl font-bold text-white mb-2">
          Vibe Clusters
        </Text>
        <View className="gap-4">
          {Object.entries(stats.vibe_clusters).map(([clusterName, themes]) => (
            <View key={clusterName}>
              <Text className="text-lg font-semibold text-white mb-1">
                {clusterName}
              </Text>
              <Text className="text-white">
                {Array.isArray(themes) ? themes.join(', ') : '—'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

export default function VaultStatsScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);
  const bgKey = trip?.video_background ?? null;

  return (
    <TripThemeProvider videoKey={bgKey ?? 'moonlight'}>
      {tripIdStr && <VaultStats tripId={tripIdStr} />}
    </TripThemeProvider>
  );
}
