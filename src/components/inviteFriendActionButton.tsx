import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  status?: 'idle' | 'loading' | 'sent' | 'failed';
  onPress: () => void;
  disabled?: boolean;
};

export default function FriendActionButton({
  status,
  onPress,
  disabled,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="px-3 py-1 bg-blue-600 rounded-full"
    >
      {status === 'sent' ? (
        <Feather name="check" size={16} color="white" />
      ) : (
        <Feather name="send" size={16} color="white" />
      )}
    </Pressable>
  );

  return (
    <View className="relative overflow-visible z-50">
      <Pressable
        onPress={() => setShowOptions(!showOptions)}
        className="px-2 py-1 rounded-full bg-zinc-800"
      >
        <Feather name="more-vertical" size={18} color="white" />
      </Pressable>
    </View>
  );
}
