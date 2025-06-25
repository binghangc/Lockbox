import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { BlurView } from 'expo-blur';
import CircularProgressArc from './circularProgressArc';

type Props = {
  cameraRef: React.RefObject<CameraView | null>;
  facing?: CameraType;
  size: number;
  maxDurationMs: number;
};

export default function VideoBubblePreview({
  cameraRef,
  facing = 'front',
  size,
  maxDurationMs,
}: Props) {
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />

      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: 'black',
        }}
      >
        <CircularProgressArc
          size={size}
          thickness={2.5}
          cycleDuration={maxDurationMs}
        >
          <CameraView
            ref={cameraRef}
            mode="video"
            facing={facing}
            mirror={facing === 'front'}
            mute={false}
            videoQuality="480p"
            videoBitrate={10000000}
            style={{ width: size, height: size }}
          />
        </CircularProgressArc>
      </View>
    </View>
  );
}
