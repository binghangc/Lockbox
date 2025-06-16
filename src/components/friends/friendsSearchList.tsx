import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce } from 'lodash';
import FormInput from '@/components/formInput';
import { Profile } from '@/types';
import { Feather } from '@expo/vector-icons';
import FriendRowBase from '@/components/friendRowBase';

type SearchResult = Profile & { status: 'accepted' | 'pending' | 'none' };

type FriendsSearchListProps = {
  actionComponent?: (user: SearchResult) => React.ReactNode;
  onUserPress?: (user: SearchResult) => void;
};

export default function FriendsSearchList({
  actionComponent,
  onUserPress,
}: FriendsSearchListProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearchUsers = async (username: string) => {
    if (!username || username.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/friends/search?username=${username}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const { error } = await res.json();
        console.error('Error fetching users:', error);
        return;
      }

      const data = await res.json();
      setResults(data ?? []);
    } catch (error) {
      console.error('Error', error);
    }
    setLoading(false);
  };

  const debouncedSearch = debounce(handleSearchUsers, 300);

  const handleChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const accepted = results.filter((r) => r.status === 'accepted');
  const notaccepted = results.filter((r) => r.status !== 'accepted');

  return (
    <View>
      <FormInput
        label="Add Friends"
        placeholder="Search by username"
        value={query}
        onChangeText={handleChange}
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
                RightAction={null} // or some status icon if you want
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
