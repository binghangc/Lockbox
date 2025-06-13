/**
 * Base template for defaultFriendRow and inviteFriendRow components.
 */
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { Profile } from '@/types';

type Props = {
  item: Profile;
  onPress: () => void;
  RightAction: React.ReactNode;
};

export default function FriendRowBase({ item, onPress, RightAction }: Props) {
  return (
    <View style={{ overflow: 'visible', position: 'relative' }}>
      <TouchableOpacity
        className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
        onPress={onPress}
      >
        <View className="w-14 h-14 rounded-full items-center justify-center">
          <View className="absolute w-14 h-14 rounded-full bg-blue-400/30 opacity-60 blur-md" />
          <View className="absolute w-12 h-12 rounded-full bg-blue-400/40 blur-sm" />
          <Image
            source={{ uri: item.avatar_url }}
            className="w-12 h-12 rounded-full border-2 border-white"
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-white text-lg font-semibold">{item.name}</Text>
          {item.username && (
            <Text className="text-white/60 text-sm">@{item.username}</Text>
          )}
        </View>
        {RightAction}
      </TouchableOpacity>
    </View>
  );
}
