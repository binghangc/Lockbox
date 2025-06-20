import React from 'react';
import { View } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';

type Props = {
  cameraRef: React.RefObject<CameraView | null>;
  facing?: CameraType;
};

export default function VideoBubblePreview({
  cameraRef,
  facing = 'front',
}: Props) {
  return (
    <View className="absolute bottom-20 right-4 w-28 h-48 rounded-2xl overflow-hidden border border-white/20">
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
  );
}
