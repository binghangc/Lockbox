import React from 'react';
import { TouchableOpacity } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTripTheme } from '@/context/TripThemeProvider';

export interface OrbVideoBubbleProps {
  hlsUrl: string;
  size?: number;
}

export default function OrbVideoBubble({
  hlsUrl,
  size = 200,
}: OrbVideoBubbleProps) {
  const theme = useTripTheme();

  const player = useVideoPlayer(hlsUrl, () => {
    // Video player initialized
  });

  return (
    <TouchableOpacity
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: theme.secondaryBackground,
      }}
      onPress={() => {
        if (player.playing) player.pause();
        else player.play();
      }}
      activeOpacity={0.9}
    >
      <VideoView
        player={player}
        style={{ width: size, height: size }}
        allowsPictureInPicture={false}
        allowsFullscreen={false}
        nativeControls={false}
        contentFit="fill"
      />
    </TouchableOpacity>
  );
}
