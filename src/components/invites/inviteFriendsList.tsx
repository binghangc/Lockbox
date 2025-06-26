import { FlatList, View, Text, Pressable } from 'react-native';
import InviteFriendRow from '@/components/invites/inviteFriendRow';
import { Feather } from '@expo/vector-icons';
import FormInput from '@/components/formInput';

type Props = {
  friends: Profile[];
  rawQuery: string;
  onQueryChange: (text: string) => void;
  inviteStatus: Record<string, 'idle' | 'loading' | 'sent' | 'failed'>;
  alreadyInvitedIds: string[];
  onSelect: (user: Profile) => void | Promise<void>;
  loading: boolean;
};

export default function InviteFriendsList({
  friends,
  rawQuery,
  onQueryChange,
  inviteStatus,
  alreadyInvitedIds,
  onSelect,
  loading,
}: Props) {
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white mb-4">Fetching your travel buddies...</Text>
        <View className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </View>
    );
  }

  return (
    <>
      <FormInput
        label="Type away"
        placeholder="Search by username"
        value={rawQuery}
        onChangeText={onQueryChange}
        placeholderTextColor="#888"
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        icon={<Feather name="search" size={20} color="#888" />}
      />

      {friends.length === 0 ? (
        <View className="flex-1 w-full mt-12 items-center">
          <Text className="text-gray-400 text-center text-base mb-3">
            No friends matched your search.
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
      ) : (
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
            />
          )}
        />
      )}
    </>
  );
}
