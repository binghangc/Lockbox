import { Pressable, Text } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';

type Props = {
  mode: 'default' | 'invite';
  status?: 'idle' | 'loading' | 'sent' | 'failed';
  onPress: () => void;
  disabled?: boolean;
};

export default function FriendActionButton({
  mode,
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
      {mode === 'invite' ? (
        status === 'sent' ? (
          <Feather name="check" size={16} color="white" />
        ) : (
          <FontAwesome5 name="paper-plane" size={16} color="white" />
        )
      ) : status === 'failed' ? (
        <Feather name="alert-circle" size={16} color="red" />
      ) : (
        <Text className="text-white text-sm">Nudge</Text>
      )}
    </Pressable>
  );
}
