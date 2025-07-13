import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import LottieView from 'lottie-react-native';
import videoBackgrounds from '@/constants/videoBackgrounds';
import effects from '@/constants/effects';

type Props = {
  videoKey: string | null;
  effectKey: string | null;
};

export default function TripVisualBackground({ videoKey, effectKey }: Props) {
  const selectedVideo = videoKey ? videoBackgrounds[videoKey] : null;
  const videoSource = selectedVideo?.uri;

  const player = useVideoPlayer(videoSource ?? '', (videoPlayer) => {
    // eslint-disable-next-line no-param-reassign
    videoPlayer.loop = true;
    // eslint-disable-next-line no-param-reassign
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        allowsVideoFrameAnalysis={false}
        showsTimecodes={false}
      />
      {effectKey && effects[effectKey]?.file && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        >
          <LottieView
            source={
              effects[effectKey]
                .file as import('lottie-react-native').AnimationObject
            }
            autoPlay
            loop
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      )}
    </>
  );
}
