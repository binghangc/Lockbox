import React from 'react';
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-bind */
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PILLBAR from '@/constants/pillbarConfig';
import AnimatedReanimated from 'react-native-reanimated';
import usePillbarController from '@/hooks/usePillbarController';
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
  const {
    panResponder,
    setBarWidth,
    animatedPanStyle,
    animatedPillTextStyle,
    animatedAccessoryStyle,
    handleLongPress,
    handlePressOut,
    dragEnabled,
  } = usePillbarController({
    status,
    onSwipeSend,
    onPressOutBubble,
    onLongPressBubble,
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
              tint={PILLBAR.BLUR_TINT as 'light' | 'dark' | 'default'}
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
                      onLongPress={handleLongPress}
                      onPressOut={handlePressOut}
                    />
                  </AnimatedReanimated.View>
                ) : (
                  <MainActionBubble
                    status={status}
                    onPress={onPressBubble}
                    onLongPress={onLongPressBubble}
                    onPressOut={handlePressOut}
                  />
                )}
                {/* Pill text */}
                <AnimatedText
                  className="text-gray-100 text-xl font-semibold flex-1"
                  style={[animatedPillTextStyle]}
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
