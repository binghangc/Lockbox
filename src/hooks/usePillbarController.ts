import { useState, useMemo, useEffect } from 'react';
import { PanResponder } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated';
import usePillbarConfig from '@/constants/pillbarConfig';

type Status = 'upcoming' | 'ongoing' | 'ended';

interface ControllerProps {
  status: Status;
  onSwipeSend?: () => void;
  onPressOutBubble?: () => void;
  onLongPressBubble?: () => void;
  submittedByUser?: boolean;
}

export default function usePillbarController({
  status,
  onSwipeSend,
  onPressOutBubble,
  onLongPressBubble,
  submittedByUser,
}: ControllerProps) {
  const PILLBAR = usePillbarConfig();
  const [dragEnabled, setDragEnabled] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  // Use submittedByUser as the source of truth for sent state
  const hasSent = submittedByUser || false;

  const threshold = useMemo(() => (barWidth - 16) * 0.5, [barWidth]);

  const isSliding = useSharedValue(false);
  const showAccessory = useSharedValue(true);
  const panX = useSharedValue(0);

  // Initialize panX position based on submitted state
  useEffect(() => {
    if (submittedByUser && barWidth > 0) {
      const maxDistance =
        barWidth -
        PILLBAR.BUBBLE_WIDTH -
        PILLBAR.PILLBAR_PADDING_HORIZONTAL * 2;
      const restricted = maxDistance - 16;
      panX.value = restricted; // Set to right position immediately
    }
  }, [submittedByUser, barWidth, panX, PILLBAR]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          status === 'ongoing' && dragEnabled && !submittedByUser,
        onMoveShouldSetPanResponder: (_, g) =>
          status === 'ongoing' &&
          dragEnabled &&
          !submittedByUser &&
          Math.abs(g.dx) > 0,
        onPanResponderMove: (_, g) => {
          if (submittedByUser) return; // Prevent movement if already submitted

          const maxDistance =
            barWidth -
            PILLBAR.BUBBLE_WIDTH -
            PILLBAR.PILLBAR_PADDING_HORIZONTAL * 2;
          const restricted = maxDistance - 16;
          panX.value = Math.min(Math.max(g.dx, 0), restricted);
        },
        onPanResponderRelease: (_, g) => {
          if (submittedByUser) return; // Prevent action if already submitted

          const maxDistance =
            barWidth -
            PILLBAR.BUBBLE_WIDTH -
            PILLBAR.PILLBAR_PADDING_HORIZONTAL * 2;
          const restricted = maxDistance - 16;

          if (g.dx > threshold) {
            panX.value = withSpring(restricted, {
              damping: 10,
              stiffness: 100,
            });
            onSwipeSend?.();
          } else {
            panX.value = withSpring(0, { damping: 10, stiffness: 100 });
            onPressOutBubble?.();
          }

          setDragEnabled(false);
          isSliding.value = false;
          showAccessory.value = true;
        },
      }),
    [
      status,
      dragEnabled,
      submittedByUser,
      onSwipeSend,
      onPressOutBubble,
      threshold,
      barWidth,
      isSliding,
      panX,
      showAccessory,
      PILLBAR,
    ],
  );

  const animatedPanStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.value }],
  }));

  const animatedPillTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      panX.value,
      [0, threshold],
      [0.7, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateX: interpolate(
          panX.value,
          [0, threshold],
          [0, threshold / 2],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const animatedAccessoryStyle = useAnimatedStyle(() => {
    const shouldShow = showAccessory.value && !isSliding.value && !hasSent;
    return {
      opacity: shouldShow ? 1 : 0,
      transform: [{ scale: shouldShow ? 1 : 0.8 }],
    };
  });

  function handleLongPress() {
    if (submittedByUser) return; // Prevent long press if already submitted

    setDragEnabled(true);
    isSliding.value = true;
    showAccessory.value = false;
    onLongPressBubble?.();
  }

  function handlePressOut() {
    if (!dragEnabled) {
      onPressOutBubble?.();
    }
    showAccessory.value = true;
  }

  return {
    panResponder,
    setBarWidth,
    animatedPanStyle,
    animatedPillTextStyle,
    animatedAccessoryStyle,
    handleLongPress,
    handlePressOut,
    dragEnabled,
    hasSent,
    threshold,
  };
}
