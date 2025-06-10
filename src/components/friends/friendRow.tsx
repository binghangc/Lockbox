import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import React from 'react';
import FriendActionButton from '@/components/friends/friendActionButton';
import type { Profile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FriendRow = Profile & { friendshipId?: string };

type Props = {
  item: FriendRow;
  mode?: 'default' | 'invite';
  alreadyInvitedIds: string[];
  inviteStatus: Record<string, 'idle' | 'loading' | 'sent' | 'failed'>;
  onSelect: (item: FriendRow) => void;
  setInviteStatus: React.Dispatch<
    React.SetStateAction<Record<string, 'idle' | 'loading' | 'sent' | 'failed'>>
  >;
  refreshList?: () => void;
};

export default function FriendRow({
  item,
  mode = 'default',
  alreadyInvitedIds,
  inviteStatus,
  onSelect,
  setInviteStatus,
  refreshList,
}: Props) {
  const status =
    inviteStatus[item.id] ??
    (alreadyInvitedIds?.includes(item.id) ? 'sent' : undefined);

  const handlePress = () => {
    if (mode === 'invite') {
      if (status === 'sent') return;

      setInviteStatus((prev) => ({ ...prev, [item.id]: 'loading' }));
      Promise.resolve(onSelect(item))
        .then(() => {
          setInviteStatus((prev) => ({ ...prev, [item.id]: 'sent' }));
        })
        .catch(() => {
          setInviteStatus((prev) => ({ ...prev, [item.id]: 'failed' }));
        });
    } else {
      onSelect(item);
    }
  };

  const handleRemoveFriend = async () => {
    Alert.alert(
      'Remove Friendship',
      `Are you sure you want to remove your friendship with ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('access_token');
            const res = await fetch(
              `
              ${process.env.EXPO_PUBLIC_API_URL}/friends/remove/${item.id}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            if (!res.ok) {
              return;
            }

            Alert.alert(
              'Friend Removed',
              `Friend removed successfully! Bye bye ${item.name}.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    refreshList?.();
                  },
                },
              ],
            );
          },
        },
      ],
    );
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
        <FriendActionButton
          mode={mode}
          status={status}
          disabled={
            mode === 'invite' &&
            (status === 'sent' || alreadyInvitedIds.includes(item.id))
          }
          onPress={handlePress}
          onRemove={handleRemoveFriend}
        />
      </TouchableOpacity>
    </View>
  );
}
