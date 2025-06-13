import { FlatList, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import DefaultFriendRow from '@/components/friends/defaultFriendRow';
import useFriends from '@/hooks/useFriends';

type Props = {
  onSelect: (user: Profile) => void | Promise<void>;
  onCountUpdate?: (count: number) => void;
};

export default function DefaultFriendsList({ onSelect, onCountUpdate }: Props) {
  const { friends, loading } = useFriends(onCountUpdate);
  const router = useRouter();

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
          You haven’t added anyone yet. Start connecting with fellow explorers!
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
        <DefaultFriendRow
          key={item.id}
          item={item}
          mode="default"
          onSelect={onSelect}
        />
      )}
    />
  );
}
