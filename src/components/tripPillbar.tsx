import React, { useEffect } from 'react';
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-bind */
import { View, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePillbarConfig from '@/constants/pillbarConfig';
import { useTripTheme } from '@/context/TripThemeProvider';
import AnimatedReanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import usePillbarController from '@/hooks/usePillbarController';
import MainActionBubble from './mainActionBubble';

const screenHeight = Dimensions.get('window').height;

const { Text: AnimatedText } = AnimatedReanimated;

export default function TripPillbar({
  status,
  pillText,
  onPressBubble,
  onLongPressBubble,
  onPressOutBubble,
  onSwipeSend,
  bottomAccessory,
  submittedByUser,
}: {
  status: 'upcoming' | 'ongoing' | 'ended';
  pillText: string;
  onPressBubble?: () => void;
  onLongPressBubble?: () => void;
  onPressOutBubble?: () => void;
  onSwipeSend?: () => void;
  bottomAccessory?: React.ReactNode;
  submittedByUser?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const PILLBAR = usePillbarConfig();
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
    submittedByUser, // Pass this to the controller
  });

  const glow = useSharedValue(0);

  useEffect(() => {
    if (status === 'upcoming') {
      glow.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
    }
  }, [status, glow]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: theme.secondaryColor,
    shadowOpacity: glow.value,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: Platform.OS === 'android' ? 10 * glow.value : 0,
  }));

  return (
    <AnimatedReanimated.View
      style={[
        status === 'upcoming' ? glowStyle : {},
        {
          position: 'absolute',
          bottom: insets.bottom + screenHeight * 0.1,
          left: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          right: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          zIndex: PILLBAR.CONTAINER_Z_INDEX + 100,
          elevation: Platform.OS === 'android' ? 99 : undefined,
        },
      ]}
    >
      {/* Pillbar */}
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={{
          position: PILLBAR.CONTAINER_POSITION,
        }}
      >
        <LinearGradient
          start={PILLBAR.GRADIENT_START}
          end={PILLBAR.GRADIENT_END}
          locations={PILLBAR.GRADIENT_LOCATIONS}
          colors={PILLBAR.GRADIENT_COLORS as [string, string, string]}
          style={{
            borderRadius: PILLBAR.BORDER_RADIUS_FULL,
            padding: PILLBAR.GRADIENT_PADDING,
          }}
        >
          <View style={{ overflow: 'hidden', borderRadius: 9999 }}>
            <BlurView
              intensity={PILLBAR.BLUR_INTENSITY}
              experimentalBlurMethod="none"
              tint={PILLBAR.BLUR_TINT as 'light' | 'dark' | 'default'}
              className="rounded-full flex-row justify-center items-center bg-white/5"
              style={[
                {
                  overflow: 'hidden',
                  borderRadius: PILLBAR.BORDER_RADIUS_FULL,
                  minHeight: PILLBAR.PILLBAR_HEIGHT,
                  paddingHorizontal: PILLBAR.PILLBAR_PADDING_HORIZONTAL,
                  paddingVertical: PILLBAR.PILLBAR_PADDING_VERTICAL,
                  backgroundColor:
                    Platform.OS === 'android'
                      ? `${theme.secondaryBackground}EE`
                      : 'transparent',
                },
              ]}
            >
              <View className="flex-row items-center">
                {status === 'ongoing' ? (
                  <AnimatedReanimated.View
                    {...(submittedByUser ? {} : panResponder.panHandlers)} // Disable pan if submitted
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
                {/* Determine pill display text without nested ternary */}
                {(() => {
                  let displayText = pillText;
                  if (submittedByUser) {
                    displayText = 'Response submitted!';
                  } else if (dragEnabled) {
                    displayText = 'Slide to send';
                  }
                  return (
                    <AnimatedText
                      className="text-xl font-semibold flex-1"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={[
                        { color: theme.primaryText, flexShrink: 1 },
                        animatedPillTextStyle,
                      ]}
                    >
                      {displayText}
                    </AnimatedText>
                  );
                })()}

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
    </AnimatedReanimated.View>
  );
}
