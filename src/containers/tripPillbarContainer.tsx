import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useHoldToRecord } from '@/hooks/video/useHoldToRecord';
import { useSlideToCancel } from '@/hooks/video/useSlideToCancel';

interface TripPillbarProps {
  status: 'upcoming' | 'ongoing' | 'ended';
  onLongPressBubble?: () => void;
  onPressOutBubble?: () => void;
}

export default function TripPillbar({
  status,
  onLongPressBubble,
  onPressOutBubble,
}: TripPillbarProps) {
  const { hold, release } = useHoldToRecord();
  const { show } = useSlideToCancel();

  return (
    <TouchableOpacity
      style={styles.pill}
      onLongPress={() => {
        hold();
        show();
        onLongPressBubble?.();
      }}
      onPressOut={() => {
        release();
        onPressOutBubble?.();
      }}
    >
      <View>
        <Text style={styles.text}>{status.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: 'blue',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});
