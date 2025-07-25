import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTripTheme } from '@/context/TripThemeProvider';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import { THEME_CONFIG, VIBE_CLUSTER_CONFIG } from '@/constants/statsConfig';

interface Trip {
  id: string;
  title: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  host: Profile;
  country?: string;
  description?: string;
  status?: string;
  is_pinned?: boolean;
  video_background?: string;
  effects?: string;
  tags?: string[];
  created_at: string;
  user_id: string;
  participants: { profile: Profile; role: Role }[];
  is_host: boolean;
}

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

interface Props {
  stats: TripStats;
  trip: Trip;
  onLayoutFinished?: () => void;
}

export default function VaultStats({ stats, trip, onLayoutFinished }: Props) {
  const theme = useTripTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ flex: 1, justifyContent: 'center' }}
      onLayout={onLayoutFinished}
    >
      <TripVisualBackground
        videoKey={trip?.video_background ?? 'moonlight'}
        effectKey={trip?.effects ?? null}
        screenshotMode
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

        {/* Top Themes */}
        <Text
          className="text-2xl font-bold mb-2"
          style={{ color: theme.primaryText }}
        >
          Top Themes
        </Text>
        <View className="flex-row flex-wrap gap-4 mb-6">
          {Object.entries(stats.theme_distribution)
            .sort(([, a], [, b]) => b - a)
            .map(([themeKey, count]) => {
              const config =
                THEME_CONFIG[themeKey as keyof typeof THEME_CONFIG];
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

        {/* Top Activities */}
        {stats.top_activity_tags.length > 0 && (
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

        {/* Top Locations */}
        {stats.top_location_tags.length > 0 && (
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

        {/* Top Keywords */}
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

        {/* Highlight Day */}
        {stats.highlight_day && (
          <View className="mb-6">
            <Text
              className="text-2xl font-bold mb-2"
              style={{ color: theme.primaryText }}
            >
              Highlight Day
            </Text>
            <Text className="text-white">
              {stats.highlight_day.date}: &quot;{stats.highlight_day.vibe}&quot;
              — {stats.highlight_day.orb_count} orb
              {stats.highlight_day.orb_count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Vibe Clusters */}
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
                    shadowOpacity: 0.6,
                    shadowRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    className="text-xl font-bold mb-1"
                    style={{ color: theme.primaryText }}
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
