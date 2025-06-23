import { FlatList, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FriendRowBase from '@/components/friendRowBase';
import useParticipants from '@/hooks/useParticipants';

type Props = {
  onSelect: (user: Profile) => void | Promise<void>;
  onCountUpdate?: (count: number) => void;
};

export default function ParticipantsList({ onSelect, onCountUpdate }: Props) {
  const { tripId } = useLocalSearchParams();
  const { participants, loading } = useParticipants(onCountUpdate);
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white mb-4">Fetching your travel buddies...</Text>
        <View className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </View>
    );
  }

  if (participants.length === 0) {
    return (
      <View className="flex-1 w-full mt-auto mb-auto items-center">
        <Text className="text-gray-400 text-center text-base mb-3 mt-3">
          You haven’t added anyone yet. Start inviting fellow explorers!
        </Text>
        <Pressable
          onPress={() => router.push(`/trips/${tripId}/send-invites`)}
          className="bg-zinc-800 px-6 py-3 rounded-xl active:bg-white/10"
        >
          <Text className="text-white text-center font-semibold">
            Find Participants
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={participants}
      keyExtractor={(item) => item.user_id}
      renderItem={({ item }) => (
        <FriendRowBase
          item={item.profile}
          onPress={() => onSelect(item.profile)}
          RightAction={null}
        />
      )}
    />
  );
}
