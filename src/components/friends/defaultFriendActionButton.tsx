import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  onRemove?: () => void;
};

export default function DefaultFriendActionButton({ onRemove }: Props) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View className="relative overflow-visible z-50">
      <Pressable
        onPress={() => setShowOptions(!showOptions)}
        className="px-2 py-1 rounded-full bg-zinc-800"
      >
        <Feather name="more-vertical" size={18} color="white" />
      </Pressable>

      {showOptions && (
        <View className="absolute right-10 top-1 bg-zinc-800 rounded-xl px-3 py-2 min-w-[150px] z-50">
          <Pressable
            onPress={() => {
              setShowOptions(false);
              onRemove?.();
            }}
            className="flex-row items-center space-x-3"
          >
            <Feather name="user-x" size={16} color="#ef4444" className="mr-1" />
            <Text
              className="text-red-500 font-semibold text-sm"
              numberOfLines={1}
            >
              Remove friendship
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
