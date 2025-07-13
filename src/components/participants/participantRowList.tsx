import React from 'react';
import { View, Text } from 'react-native';
import ParticipantAvatar from '@/components/participants/participantAvatar';
import useParticipants from '@/hooks/useParticipants';
import { Profile } from '@/types';

type Props = {
  onSelect: (user: Profile) => void | Promise<void>;
  onCountUpdate?: (count: number) => void;
};

export default function ParticipantRowList({ onSelect, onCountUpdate }: Props) {
  const { participants, loading } = useParticipants(onCountUpdate);

  const unique = Array.from(
    new Map(participants.map((p) => [p.profile.id, p])).values(),
  );
  const visible = unique.slice(0, 4);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white mb-4">Fetching your travel buddies...</Text>
        <View className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </View>
    );
  }

  return (
    <View className="flex-row items-center space-x-3">
      {visible.map((p, idx) => (
        <ParticipantAvatar
          key={p.user_id || idx}
          name={p.profile?.name}
          avatarUrl={p.profile?.avatar_url}
          size={48}
          isHost={p.role === 'host'}
          onPress={() => onSelect?.(p.profile)}
        />
      ))}
    </View>
  );
}
