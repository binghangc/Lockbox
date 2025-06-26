import { View, Text, Pressable } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';

const getButtonBg = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-purple-700';
    case 'incoming':
      return 'bg-orange-400';
    default:
      return 'bg-white';
  }
};

const getButtonTextAndColor = (
  status: string,
): { text: string; color: string } => {
  switch (status) {
    case 'pending':
      return { text: 'Request Sent', color: 'text-white' };
    case 'incoming':
      return { text: 'Check Requests', color: 'text-white' };
    default:
      return { text: 'Add friend', color: 'text-black' };
  }
};

export default function AddFriendRow({
  onAddFriend,
  onMoreOptions,
  status = 'none',
}: {
  onAddFriend: () => void;
  onMoreOptions: () => void;
  status?: 'accepted' | 'pending' | 'none';
}) {
  const { text, color } = getButtonTextAndColor(status);
  return (
    <View className="flex-row items-center justify-center mt-4">
      {/* Add Friend Button */}
      <Pressable
        onPress={onAddFriend}
        disabled={status !== 'none'}
        className={`flex-row items-center justify-center min-w-[200px] rounded-2xl px-6 py-3 ${getButtonBg(status)}`}
      >
        <Feather
          name="user-plus"
          size={18}
          color={status !== 'none' ? 'white' : 'black'}
          className="mr-2"
        />
        <Text className={`font-semibold text-base ${color}`}>{text}</Text>
      </Pressable>

      {/* More Options Button */}
      <Pressable
        onPress={onMoreOptions}
        className="w-11 h-11 rounded-2xl border border-white items-center justify-center ml-3"
      >
        <Entypo name="dots-three-horizontal" size={18} color="white" />
      </Pressable>
    </View>
  );
}
