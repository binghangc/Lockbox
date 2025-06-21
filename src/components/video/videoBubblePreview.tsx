import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { BlurView } from 'expo-blur';

type Props = {
  cameraRef: React.RefObject<CameraView | null>;
  facing?: CameraType;
};

export default function VideoBubblePreview({
  cameraRef,
  facing = 'front',
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
          width: 200,
          height: 200,
          borderRadius: 100,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backgroundColor: 'black',
        }}
      >
        <CameraView
          ref={cameraRef}
          mode="video"
          facing={facing}
          mirror={facing === 'front'}
          mute={false}
          videoQuality="480p"
          videoBitrate={10000000}
          className="w-full h-full"
        />
      </View>
    </View>
  );
}
