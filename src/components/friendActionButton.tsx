import { Pressable, Text } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';

type Props = {
  mode: 'default' | 'invite';
  status: 'idle' | 'loading' | 'sent' | 'failed';
  onPress: () => void;
  disabled: boolean;
};

export default function FriendActionButton({
  mode,
  status = 'idle',
  onPress,
  disabled = false,
}: Props) {
  let content;
  if (mode === 'invite') {
    if (status === 'sent') {
      content = <Feather name="check" size={16} color="white" />;
    } else {
      content = <FontAwesome5 name="paper-plane" size={16} color="white" />;
    }
  } else if (status === 'failed') {
    content = <Feather name="alert-circle" size={16} color="red" />;
  } else {
    content = <Text className="text-white text-sm">Nudge</Text>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="px-3 py-1 bg-blue-600 rounded-full"
    >
      {content}
    </Pressable>
  );
}
