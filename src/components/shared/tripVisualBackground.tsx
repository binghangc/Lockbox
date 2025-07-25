/* eslint-disable react/display-name */
/* eslint-disable no-param-reassign */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import LottieView from 'lottie-react-native';
import videoBackgrounds from '@/constants/videoBackgrounds';
import effects from '@/constants/effects';

type Props = {
  videoKey: string | null;
  effectKey: string | null;
};

export type TripVisualBackgroundHandle = {
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

const TripVisualBackground = forwardRef<TripVisualBackgroundHandle, Props>(
  ({ videoKey, effectKey }, ref) => {
    const selectedVideo = videoKey ? videoBackgrounds[videoKey] : null;
    const videoSource = selectedVideo?.uri;

    const lottieRef = useRef<LottieView>(null);

    const player = useVideoPlayer(videoSource ?? '', (videoPlayer) => {
      videoPlayer.loop = true;
      videoPlayer.muted = true;
      videoPlayer.play();
    });

    useImperativeHandle(ref, () => ({
      pause: () => {
        player?.pause();
        lottieRef.current?.pause();
      },
      resume: () => {
        player?.play();
        lottieRef.current?.resume();
      },
      reset: () => {
        player?.seek(0);
        player?.play();
        lottieRef.current?.reset();
        lottieRef.current?.play();
      },
    }));

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
              zIndex: 11,
            }}
          >
            <LottieView
              ref={lottieRef}
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
  },
);

export default TripVisualBackground;
