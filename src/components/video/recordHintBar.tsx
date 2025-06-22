import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { BlurView } from 'expo-blur';

export default function RecordHintBar() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      delay: 1500,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View
      className="absolute bottom-24 left-6 z-50 items-start"
      style={{ opacity }}
    >
      <BlurView
        intensity={60}
        tint="dark"
        className="px-4 py-2 bg-white/10 rounded-3xl overflow-hidden relative"
      >
        <Text className="text-white text-base">Hold to record video</Text>
        <Text
          className="absolute -bottom-2 left-2"
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 6,
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: 'rgba(255,255,255,0.1)',
          }}
        />
      </BlurView>
    </Animated.View>
  );
}
