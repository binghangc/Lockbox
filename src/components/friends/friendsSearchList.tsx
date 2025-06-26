import { View, Text, ActivityIndicator } from 'react-native';
import FormInput from '@/components/formInput';
import { Profile } from '@/types';
import { Feather } from '@expo/vector-icons';
import FriendRowBase from '@/components/friendRowBase';

type SearchResult = Profile & { status: 'accepted' | 'pending' | 'none' };

type FriendsSearchListProps = {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onChangeQuery: (text: string) => void;
  actionComponent?: (user: SearchResult) => React.ReactNode;
  onUserPress?: (user: SearchResult) => void;
};

export default function FriendsSearchList({
  results,
  loading,
  query,
  onChangeQuery,
  actionComponent,
  onUserPress,
}: FriendsSearchListProps) {
  const accepted = results.filter((r) => r.status === 'accepted');
  const notaccepted = results.filter((r) => r.status !== 'accepted');

  return (
    <View>
      <FormInput
        label="Add Friends"
        placeholder="Search by username"
        value={query}
        onChangeText={onChangeQuery}
        placeholderTextColor="#888"
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        icon={<Feather name="search" size={20} color="#888" />}
      />

      {loading && <ActivityIndicator color="white" className="mt-4" />}

      <View className="mt-4">
        {accepted.length > 0 && (
          <>
            <Text className="text-white text-sm font-semibold mb-2">
              MY FRIENDS
            </Text>
            {accepted.map((item) => (
              <FriendRowBase
                key={item.id}
                item={item}
                onPress={() => onUserPress?.(item)}
                RightAction={null}
              />
            ))}
          </>
        )}

        {notaccepted.length > 0 && (
          <>
            <Text className="text-white text-sm font-semibold mt-4 mb-2">
              USERS
            </Text>
            {notaccepted.map((item) => (
              <FriendRowBase
                key={item.id}
                item={item}
                onPress={() => onUserPress?.(item)}
                RightAction={actionComponent?.(item) ?? null}
              />
            ))}
          </>
        )}
      </View>
    </View>
  );
}
