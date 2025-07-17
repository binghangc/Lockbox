import useOrbsByVibecheck from '@/hooks/useOrbsByVibecheck';
import {
  View,
  Text,
  ViewStyle,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTripTheme } from '@/context/TripThemeProvider';
import { VideoView, useVideoPlayer } from 'expo-video';

interface ResponseFeedProps {
  vibecheckId: string;
  style?: ViewStyle;
}

function LoadingShimmer() {
  const theme = useTripTheme();

  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      {[...Array(3)].map((_, _index) => (
        <View
          key={`shimmer-static-${Math.random().toString(36).substr(2, 9)}`}
          style={{
            marginBottom: 24,
          }}
        >
          {/* User info with avatar circle and rectangle */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: `${theme.optionalText}20`,
                marginRight: 12,
              }}
            />
            <View
              style={{
                height: 16,
                backgroundColor: `${theme.optionalText}20`,
                borderRadius: 8,
                width: 120,
              }}
            />
          </View>

          {/* Large video bubble shimmer */}
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: `${theme.optionalText}20`,
            }}
          />
        </View>
      ))}
    </View>
  );
}

export default function ResponseFeed({
  vibecheckId,
  style,
}: ResponseFeedProps) {
  const theme = useTripTheme();
  const { orbs, loading } = useOrbsByVibecheck(vibecheckId);

  return (
    <BlurView
      intensity={60}
      tint={theme.blurrierTint as 'light' | 'dark'}
      style={[{ flex: 1 }, style]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.secondaryOutline,
            paddingBottom: 12,
            paddingHorizontal: 20,
            paddingTop: 20,
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.primaryText,
              textAlign: 'left',
            }}
          >
            Responses {!loading && orbs.length > 0 && `(${orbs.length})`}
          </Text>
        </View>

        {(() => {
          if (loading) {
            return <LoadingShimmer />;
          }
          if (orbs.length === 0) {
            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 20,
                  minHeight: 400,
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: `${theme.optionalText}15`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>😢</Text>
                </View>
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 18,
                    color: theme.primaryText,
                    marginBottom: 8,
                  }}
                >
                  No responses
                </Text>
              </View>
            );
          }
          return (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {orbs.map((orb) => (
                <OrbRow key={orb.id} orb={orb} />
              ))}
            </ScrollView>
          );
        })()}
      </View>
    </BlurView>
  );
}

interface Orb {
  id: string;
  hlsUrl: string;
  user: {
    name: string;
    avatar_url: string;
  };
  created_at: string;
}

function OrbRow({ orb }: { orb: Orb }) {
  const theme = useTripTheme();

  console.log('Playing HLS URL:', orb.hlsUrl);

  const player = useVideoPlayer(orb.hlsUrl, (_player) => {
    console.log('Video player initialized for:', orb.hlsUrl);
  });

  const BUBBLE_SIZE = 200;

  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      {/* User info header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Image
          source={{ uri: orb.user.avatar_url }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            marginRight: 12,
          }}
          onError={(error) => console.log('Avatar load error:', error)}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.primaryText,
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            {orb.user.name}
          </Text>
          <Text
            style={{
              color: theme.secondaryText,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {new Date(orb.created_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Circular video player */}
      <View
        style={{
          alignItems: 'flex-start',
          marginVertical: 4,
        }}
      >
        <TouchableOpacity
          style={{
            width: BUBBLE_SIZE,
            height: BUBBLE_SIZE,
            borderRadius: BUBBLE_SIZE / 2,
            overflow: 'hidden',
            backgroundColor: theme.secondaryBackground,
          }}
          onPress={() => {
            // Toggle play/pause on tap
            if (player.playing) {
              player.pause();
            } else {
              player.play();
            }
          }}
        >
          <VideoView
            player={player}
            style={{
              width: BUBBLE_SIZE,
              height: BUBBLE_SIZE,
            }}
            allowsPictureInPicture={false}
            allowsFullscreen={false}
            nativeControls={false}
            contentFit="fill"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
