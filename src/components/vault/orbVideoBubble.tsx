import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTripTheme } from '@/context/TripThemeProvider';
import CircularPlaybackArc from '@/components/vault/circularPlaybackArc';

export interface OrbVideoBubbleProps {
  hlsUrl: string;
  size?: number;
}

export default function OrbVideoBubble({
  hlsUrl,
  size = 200,
}: OrbVideoBubbleProps) {
  const theme = useTripTheme();
  const [progress, setProgress] = React.useState(0);

  const player = useVideoPlayer(hlsUrl, () => {
    // Video player initialized
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (player && player.duration > 0) {
        setProgress(player.currentTime / player.duration);
      } else {
        setProgress(0);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [player]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (player.playing) player.pause();
        else player.play();
      }}
      activeOpacity={0.9}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: theme.secondaryBackground,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          allowsPictureInPicture={false}
          allowsFullscreen={false}
          nativeControls={false}
          contentFit="cover"
        />
        <CircularPlaybackArc
          size={size}
          thickness={4}
          color="rgba(255,255,255,0.85)"
          progress={progress}
        />
      </View>
    </TouchableOpacity>
  );
}
