import React, { useState, useMemo } from 'react';
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-bind */
import { View, PanResponder } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PILLBAR from '@/constants/pillbarConfig';
import AnimatedReanimated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import MainActionBubble from './mainActionBubble';

const { Text: AnimatedText } = AnimatedReanimated;

export default function TripPillbar({
  status,
  pillText,
  onPressBubble,
  onLongPressBubble,
  onPressOutBubble,
  onSwipeSend,
  bottomAccessory,
}: {
  status: 'upcoming' | 'ongoing' | 'ended';
  pillText: string;
  onPressBubble?: () => void;
  onLongPressBubble?: () => void;
  onPressOutBubble?: () => void;
  onSwipeSend?: () => void;
  bottomAccessory?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [dragEnabled, setDragEnabled] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const threshold = useMemo(() => (barWidth - 16) * 0.5, [barWidth]);
  const isSliding = useSharedValue(false);
  const showAccessory = useSharedValue(true);

  const panX = useSharedValue(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => status === 'ongoing' && dragEnabled,
        onMoveShouldSetPanResponder: (_, gesture) =>
          status === 'ongoing' && dragEnabled && Math.abs(gesture.dx) > 0,
        onPanResponderMove: (_, gestureState) => {
          const maxDistance =
            barWidth -
            PILLBAR.BUBBLE_WIDTH -
            PILLBAR.PILLBAR_PADDING_HORIZONTAL * 2;
          if (gestureState.dx < 0) {
            panX.value = 0;
          } else {
            const restrictedDistance = maxDistance - 16;
            panX.value = Math.min(gestureState.dx, restrictedDistance);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (status === 'ongoing' && dragEnabled) {
            if (gesture.dx > threshold) {
              console.log('Slide to send triggered');
              if (onSwipeSend) onSwipeSend();
              if (onPressOutBubble) onPressOutBubble();
            } else if (onPressOutBubble) {
              console.log('Slide to cancel triggered');
              onPressOutBubble();
            }
            panX.value = 0;
            setDragEnabled(false);
            isSliding.value = false;
            showAccessory.value = true;
          }
        },
      }),
    [
      status,
      dragEnabled,
      onSwipeSend,
      onPressOutBubble,
      threshold,
      barWidth,
      isSliding,
      panX,
    ],
  );

  function handleLongPressWrapper() {
    setDragEnabled(true);
    isSliding.value = true;
    showAccessory.value = false;
    if (onLongPressBubble) onLongPressBubble();
  }

  function handlePressOutWrapper() {
    if (!dragEnabled) {
      if (onPressOutBubble) onPressOutBubble();
    }
    showAccessory.value = true;
  }

  const animatedPillTextStyle = useAnimatedStyle(() => {
    const inputRange = [0, threshold];
    return {
      opacity: interpolate(
        panX.value,
        inputRange,
        [0.7, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            panX.value,
            inputRange,
            [0, panX.value],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const animatedPanStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: panX.value,
      },
    ],
  }));

  const animatedAccessoryStyle = useAnimatedStyle(() => {
    const shouldShow = showAccessory.value && !isSliding.value;
    return {
      opacity: shouldShow ? 1 : 0,
      transform: [{ scale: shouldShow ? 1 : 0.8 }],
    };
  });

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
                  <AnimatedReanimated.View
                    {...panResponder.panHandlers}
                    style={[animatedPanStyle]}
                  >
                    <MainActionBubble
                      status={status}
                      onPress={onPressBubble}
                      onLongPress={handleLongPressWrapper}
                      onPressOut={handlePressOutWrapper}
                    />
                  </AnimatedReanimated.View>
                ) : (
                  <MainActionBubble
                    status={status}
                    onPress={onPressBubble}
                    onLongPress={onLongPressBubble}
                    onPressOut={handlePressOutWrapper}
                  />
                )}
                {/* Pill text */}
                <AnimatedText
                  className="text-gray-100 text-xl font-semibold flex-1"
                  style={animatedPillTextStyle}
                >
                  {dragEnabled ? 'Slide to send' : pillText}
                </AnimatedText>

                {bottomAccessory && (
                  <AnimatedReanimated.View
                    style={[{ marginLeft: 8 }, animatedAccessoryStyle]}
                  >
                    {bottomAccessory}
                  </AnimatedReanimated.View>
                )}
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
