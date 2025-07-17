import useOrbsByVibecheck from '@/hooks/useOrbsByVibecheck';
import { View, Text, ViewStyle, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTripTheme } from '@/context/TripThemeProvider';
import { VideoView, useVideoPlayer } from 'expo-video';

interface ResponseFeedProps {
  vibecheckId: string;
  style?: ViewStyle;
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
      <View
        style={{
          paddingTop: 20,
        }}
      >
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.secondaryOutline,
            paddingBottom: 12,
            paddingHorizontal: 20,
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
            Responses {orbs.length > 0 && `(${orbs.length})`}
          </Text>
        </View>
        {loading ? (
          <Text style={{ color: theme.secondaryText, padding: 20 }}>
            Loading responses...
          </Text>
        ) : (
          <ScrollView>
            {orbs.map((orb) => (
              <OrbRow key={orb.id} orb={orb} />
            ))}
          </ScrollView>
        )}
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
  
  const player = useVideoPlayer(
    orb.hlsUrl,
    (player) => {
      console.log('Video player initialized for:', orb.hlsUrl);
      // Don't auto-play, let user start manually
    }
  );

  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
      {/* User info header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
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
            {new Date(orb.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Large video thumbnail */}
      <VideoView
        player={player}
        style={{
          width: '100%',
          height: 200,
          borderRadius: 12,
          backgroundColor: theme.secondaryBackground,
        }}
        allowsPictureInPicture={false}
        allowsFullscreen={true}
        nativeControls={true}
      />
      
      {/* Debug info */}
      <Text style={{ 
        color: theme.optionalText, 
        fontSize: 10, 
        marginTop: 4 
      }}>
        HLS: {orb.hlsUrl}
      </Text>
    </View>
  );
}
