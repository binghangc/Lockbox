import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ICONS = {
  idle: { name: 'send', color: 'white', bg: 'bg-blue-600' },
  loading: { name: 'loader', color: 'white', bg: 'bg-blue-400' },
  pending: { name: 'clock', color: 'white', bg: 'bg-yellow-500' },
  accepted: { name: 'user-check', color: 'white', bg: 'bg-green-600' },
  declined: { name: 'user-x', color: 'white', bg: 'bg-red-500' },
  failed: { name: 'refresh-ccw', color: 'white', bg: 'bg-orange-500' },
} as const;

type Props = {
  status?: 'idle' | 'loading' | 'pending' | 'accepted' | 'declined' | 'failed';
  onPress: () => void;
  disabled?: boolean;
};

export default function InviteFriendActionButton({
  status = 'idle',
  onPress,
  disabled,
}: Props) {
  const { name, color, bg } = ICONS[status];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-3 py-1 rounded-full ${bg}`}
    >
      <Feather name={name} size={16} color={color} />
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
