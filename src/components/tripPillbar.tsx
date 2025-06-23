import React, { useRef, useState, useMemo } from 'react';
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-bind */
import { View, Text, Animated, PanResponder } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PILLBAR from '@/constants/pillbarConfig';
import MainActionBubble from './mainActionBubble';

export default function TripPillbar({
  status,
  pillText,
  onPressBubble,
  onLongPressBubble,
  onPressOutBubble,
  onSwipeSend,
}: {
  status: 'upcoming' | 'ongoing' | 'ended';
  pillText: string;
  onPressBubble?: () => void;
  onLongPressBubble?: () => void;
  onPressOutBubble?: () => void;
  onSwipeSend?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY()).current;
  const [dragEnabled, setDragEnabled] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const threshold = useMemo(() => barWidth * 0.75, [barWidth]);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => status === 'ongoing' && dragEnabled,
        onMoveShouldSetPanResponder: (_, gesture) =>
          status === 'ongoing' && dragEnabled && Math.abs(gesture.dx) > 5,
        onPanResponderMove: Animated.event([null, { dx: pan.x }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (status === 'ongoing' && dragEnabled) {
            if (gesture.dx > threshold) {
              console.log('send');
              if (onSwipeSend) onSwipeSend();
              // stop recording after a successful swipe
              if (onPressOutBubble) onPressOutBubble();
            } else {
              console.log('cancel');
              if (onPressOutBubble) onPressOutBubble();
            }
            // reset position & drag state
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
            setDragEnabled(false);
          }
        },
      }),
    [status, dragEnabled, pan, onSwipeSend, onPressOutBubble, threshold],
  );

  function handleLongPressWrapper() {
    setDragEnabled(true);
    if (onLongPressBubble) onLongPressBubble();
  }

  function handlePressOutWrapper() {
    if (!dragEnabled) {
      if (onPressOutBubble) onPressOutBubble();
    }
  }

  return (
    <>
      {/* Pillbar */}
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={{
          position: PILLBAR.CONTAINER_POSITION,
          bottom: insets.bottom + PILLBAR.CONTAINER_BOTTOM_OFFSET,
          left: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          right: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          zIndex: PILLBAR.CONTAINER_Z_INDEX,
        }}
      >
        <LinearGradient
          start={PILLBAR.GRADIENT_START}
          end={PILLBAR.GRADIENT_END}
          locations={PILLBAR.GRADIENT_LOCATIONS}
          colors={PILLBAR.GRADIENT_COLORS}
          style={{
            borderRadius: PILLBAR.BORDER_RADIUS_FULL,
            padding: PILLBAR.GRADIENT_PADDING,
          }}
        >
          <View style={{ overflow: 'hidden', borderRadius: 9999 }}>
            <BlurView
              intensity={PILLBAR.BLUR_INTENSITY}
              tint={PILLBAR.BLUR_TINT}
              className="rounded-full flex-row justify-center items-center bg-white/5"
              style={[
                {
                  overflow: 'hidden',
                  borderRadius: PILLBAR.BORDER_RADIUS_FULL,
                  minHeight: PILLBAR.PILLBAR_HEIGHT,
                  paddingHorizontal: PILLBAR.PILLBAR_PADDING_HORIZONTAL,
                  paddingVertical: PILLBAR.PILLBAR_PADDING_VERTICAL,
                },
              ]}
            >
              <View className="flex-row items-center">
                {status === 'ongoing' ? (
                  <Animated.View
                    {...panResponder.panHandlers}
                    style={{ transform: [{ translateX: pan.x }] }}
                  >
                    <MainActionBubble
                      status={status}
                      onPress={onPressBubble}
                      onLongPress={handleLongPressWrapper}
                      onPressOut={handlePressOutWrapper}
                    />
                  </Animated.View>
                ) : (
                  <MainActionBubble
                    status={status}
                    onPress={onPressBubble}
                    onLongPress={onLongPressBubble}
                    onPressOut={handlePressOutWrapper}
                  />
                )}
                {/* Pill text */}
                <Text className="text-gray-100 text-xl font-semibold flex-1">
                  {pillText}
                </Text>
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
