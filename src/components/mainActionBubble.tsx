import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import PILLBAR from '@/constants/pillbarConfig';

const styles = StyleSheet.create({
  bubbleContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    width: PILLBAR.BUBBLE_WIDTH,
    height: PILLBAR.BUBBLE_HEIGHT,
    borderRadius: PILLBAR.BUBBLE_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: PILLBAR.BUBBLE_MARGIN_RIGHT,
    marginLeft: PILLBAR.BUBBLE_MARGIN_LEFT,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bubbleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: PILLBAR.BUBBLE_RADIUS,
    overflow: 'hidden',
  },
});

export default function MainActionBubble({
  status,
  onPress,
  onLongPress,
  onPressOut,
}: {
  status: 'upcoming' | 'ongoing' | 'ended';
  onPress?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
}) {
  let mainActionIcon;
  if (status === 'upcoming') {
    mainActionIcon = <Text className="text-3xl">✨</Text>;
  } else if (status === 'ongoing') {
    mainActionIcon = <Text className="text-3xl">🎥</Text>;
  } else if (status === 'ended') {
    mainActionIcon = <Text className="text-3xl">🔓</Text>;
  }

  return (
    <TouchableOpacity
      style={styles.bubbleContainer}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      hitSlop={10}
      pressRetentionOffset={{
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      }}
    >
      <LinearGradient
        start={[0.2, 0.2]}
        end={[0.8, 0.8]}
        colors={[
          'rgba(255,255,255,0.25)',
          'rgba(255,255,255,0.05)',
          'rgba(255,255,255,0)',
        ]}
        style={styles.bubbleGradient}
      />
      {mainActionIcon}
    </TouchableOpacity>
  );
}
