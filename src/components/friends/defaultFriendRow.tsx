import { Alert } from 'react-native';
import React from 'react';
import DefaultFriendActionButton from '@/components/friends/defaultFriendActionButton';
import FriendRowBase from '@/components/friendRowBase';
import type { Profile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FriendRow = Profile & { friendshipId?: string };

type Props = {
  item: FriendRow;
  onSelect: (item: FriendRow) => void;
  refreshList?: () => void;
};

export default function DefaultFriendRow({
  item,
  onSelect,
  refreshList,
}: Props) {
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
    <FriendRowBase
      item={item}
      onPress={() => onSelect(item)}
      RightAction={<DefaultFriendActionButton onRemove={handleRemoveFriend} />}
    />
  );
}
