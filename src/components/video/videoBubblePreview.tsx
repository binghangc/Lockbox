import { VideoQuality, CameraView, CameraType } from 'expo-camera';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import VIDEO_CONFIG from '@/constants/videoConfig';
import CircularProgressArc from './circularProgressArc';

type Props = {
  cameraRef: React.RefObject<CameraView | null>;
  facing?: CameraType;
  onCameraReady?: () => void;
};

export default function VideoBubblePreview({
  cameraRef,
  facing = 'front',
  onCameraReady,
}: Props) {
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />

      <View
        style={{
          width: VIDEO_CONFIG.BUBBLE_SIZE,
          height: VIDEO_CONFIG.BUBBLE_SIZE,
          borderRadius: VIDEO_CONFIG.BUBBLE_SIZE / 2,
          overflow: 'hidden',
          backgroundColor: 'black',
        }}
      >
        <CircularProgressArc
          size={VIDEO_CONFIG.BUBBLE_SIZE}
          thickness={2.5}
          cycleDuration={VIDEO_CONFIG.MAX_DURATION * 1000}
        >
          <CameraView
            ref={cameraRef}
            mode="video"
            facing={facing}
            mirror={facing === 'front'}
            mute={false}
            videoQuality={VIDEO_CONFIG.VIDEO_QUALITY as VideoQuality}
            videoBitrate={VIDEO_CONFIG.VIDEO_BITRATE}
            style={{
              width: VIDEO_CONFIG.BUBBLE_SIZE,
              height: VIDEO_CONFIG.BUBBLE_SIZE,
            }}
            onCameraReady={onCameraReady}
          />
        </CircularProgressArc>
      </View>
    </View>
  );
}
