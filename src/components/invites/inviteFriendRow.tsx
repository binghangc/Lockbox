import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import InviteFriendActionButton from '@/components/invites/inviteFriendActionButton';
import type { Profile } from '@/types';

type FriendRow = Profile & { friendshipId?: string };

type Props = {
  item: FriendRow;
  alreadyInvitedIds: string[];
  inviteStatus: Record<string, 'idle' | 'loading' | 'sent' | 'failed'>;
  onSelect: (item: FriendRow) => void;
  setInviteStatus: React.Dispatch<
    React.SetStateAction<Record<string, 'idle' | 'loading' | 'sent' | 'failed'>>
  >;
};

export default function InviteFriendRow({
  item,
  alreadyInvitedIds,
  inviteStatus,
  onSelect,
  setInviteStatus,
}: Props) {
  const status =
    inviteStatus[item.id] ??
    (alreadyInvitedIds?.includes(item.id) ? 'sent' : undefined);

  const handlePress = () => {
    if (status === 'sent') return;

    setInviteStatus((prev) => ({ ...prev, [item.id]: 'loading' }));
    Promise.resolve(onSelect(item))
      .then(() => {
        setInviteStatus((prev) => ({ ...prev, [item.id]: 'sent' }));
      })
      .catch(() => {
        setInviteStatus((prev) => ({ ...prev, [item.id]: 'failed' }));
      });
  };

  return (
    <View style={{ overflow: 'visible', position: 'relative' }}>
      <TouchableOpacity
        key={item.id}
        className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
        onPress={() => onSelect(item)}
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
        <InviteFriendActionButton
          status={status}
          disabled={status === 'sent' || alreadyInvitedIds.includes(item.id)}
          onPress={handlePress}
        />
      </TouchableOpacity>
    </View>
  );
}
