import { FlatList, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import InviteFriendRow from '@/components/invites/inviteFriendRow';
import useFriends from '@/hooks/useFriends';

type Props = {
  onSelect: (user: Profile) => void | Promise<void>;
  alreadyInvitedIds?: string[];
  onCountUpdate?: (count: number) => void;
};

export default function InviteFriendsList({
  onSelect,
  alreadyInvitedIds = [],
  onCountUpdate,
}: Props) {
  const { friends, loading } = useFriends(onCountUpdate);
  const router = useRouter();
  const [inviteStatus, setInviteStatus] = useState<
    Record<string, 'idle' | 'loading' | 'sent' | 'failed'>
  >({});

  useEffect(() => {
    const updatedStatus = alreadyInvitedIds.reduce(
      (acc, id) => {
        acc[id] = 'sent';
        return acc;
      },
      {} as Record<string, 'sent'>,
    );
    setInviteStatus(updatedStatus);
  }, [alreadyInvitedIds]);

  useEffect(() => {
    if (!loading) {
      onCountUpdate?.(friends.length);
    }
  }, [friends.length, loading, onCountUpdate]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white mb-4">Fetching your travel buddies...</Text>
        <View className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View className="flex-1 w-full mt-auto mb-auto items-center">
        <Text className="text-gray-400 text-center text-base mb-3 mt-3">
          No friends to invite! Find some friends to join you on this trip now.
        </Text>
        <Pressable
          onPress={() => router.push('/friends/search')}
          className="bg-zinc-800 px-6 py-3 rounded-xl active:bg-white/10"
        >
          <Text className="text-white text-center font-semibold">
            Find Friends
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <InviteFriendRow
          key={item.id}
          item={item}
          alreadyInvitedIds={alreadyInvitedIds}
          inviteStatus={inviteStatus}
          onSelect={onSelect}
          setInviteStatus={setInviteStatus}
        />
      )}
    />
  );
}
