import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTripTheme } from '@/context/TripThemeProvider';
import AnimatedReanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Vibe = {
  id: string;
  prompt: string;
  date: string;
};

type VibeCardProps = {
  vibe: Vibe;
  index: number;
  scrollX: number;
  itemWidth: number;
  isSelected: boolean;
  isScrolling: boolean;
  onPress: () => void;
};

export default function VibeCard({
  vibe,
  isSelected,
  scrollX,
  index,
  itemWidth,
  isScrolling,
  onPress,
}: VibeCardProps) {
  const theme = useTripTheme();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (isSelected && !isScrolling) {
      glow.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
    } else {
      glow.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected, isScrolling, glow]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const scaleStyle = useAnimatedStyle(() => {
    // Calculate distance from center based on scroll position
    const itemPosition = index * itemWidth;
    const distance = Math.abs(scrollX - itemPosition);
    const maxDistance = itemWidth * 1.5; // Increase range for smoother transition

    // Normalize distance (0 = center, 1 = max distance)
    const normalizedDistance = Math.min(distance / maxDistance, 1);

    // Use easing function for smoother transition
    const eased = 1 - (1 - normalizedDistance) ** 2;

    // Scale from 1.15 (center) to 0.85 (far) - smaller difference
    const scale = 1.15 - eased * 0.3;

    return {
      transform: [{ scale }],
    };
  }, [scrollX, index, itemWidth]);

  const borderStyle = useAnimatedStyle(() => {
    const itemPosition = index * itemWidth;
    const distance = Math.abs(scrollX - itemPosition);
    const normalizedDistance = Math.min(distance / (itemWidth * 1.5), 1);

    // Smooth easing
    const eased = 1 - (1 - normalizedDistance) ** 2;

    // Border radius from 16 (center) to 12 (far) - more rounded
    const borderRadius = 16 - eased * 4;

    return {
      borderRadius,
    };
  }, [scrollX, index, itemWidth]);

  const opacityStyle = useAnimatedStyle(() => {
    const itemPosition = index * itemWidth;
    const distance = Math.abs(scrollX - itemPosition);
    const normalizedDistance = Math.min(distance / (itemWidth * 1.5), 1);

    // Smooth easing
    const eased = 1 - (1 - normalizedDistance) ** 2;

    // Opacity from 0.96 (center) to 0.6 (far) - less dramatic
    const opacity = normalizedDistance < 0.01 ? 0.96 : 1 - eased * 0.6;

    return {
      opacity,
    };
  }, [scrollX, index, itemWidth]);

  return (
    <AnimatedReanimated.View style={[scaleStyle, { overflow: 'visible' }]}>
      <AnimatedReanimated.View style={[borderStyle, { overflow: 'visible' }]}>
        <AnimatedReanimated.View style={[opacityStyle, { overflow: 'visible' }]}>
          <TouchableOpacity
            onPress={onPress}
            style={{
              width: 200,
              minHeight: 100,
              backgroundColor: theme.inverseBackground,
              marginHorizontal: 12,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 5,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: theme.secondaryBackground,
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: 14,
                  marginBottom: 8,
                  lineHeight: 18,
                }}
              >
                {vibe.prompt}
              </Text>
              <Text
                style={{
                  color: theme.optionalText,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                {formatDate(vibe.date)}
              </Text>
            </View>
          </TouchableOpacity>
        </AnimatedReanimated.View>
      </AnimatedReanimated.View>
    </AnimatedReanimated.View>
  );
}
