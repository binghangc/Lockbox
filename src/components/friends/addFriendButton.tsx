import { TouchableOpacity, Text, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function AddFriendButton({
  status,
  onPress,
}: {
  status: 'none' | 'pending' | 'incoming' | 'accepted';
  onPress: () => void;
}) {
  const prevStatus = usePrevious(status);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (prevStatus !== 'pending' && status === 'pending') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status, prevStatus, scaleAnim]);

  if (status === 'pending') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Feather name="check" size={20} color="#4ade80" />
      </Animated.View>
    );
  }

  if (status === 'incoming') {
    return <Feather name="user-check" size={20} color="#fb923c" />;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-700 px-3 py-1 rounded-md"
    >
      <Text className="text-white font-semibold text-sm">ADD</Text>
    </TouchableOpacity>
  );
}
