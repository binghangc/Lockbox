import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce } from 'lodash';
import FormInput from '@/components/formInput';
import { Profile } from '@/types';
import { Feather } from '@expo/vector-icons';

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
              <TouchableOpacity
                key={item.id}
                className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
                onPress={() => onUserPress(item)}
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
                  <Text className="text-white text-lg font-semibold">
                    {item.name}
                  </Text>
                  {item.username && (
                    <Text className="text-white/60 text-sm">
                      @{item.username}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {notaccepted.length > 0 && (
          <>
            <Text className="text-white text-sm font-semibold mt-4 mb-2">
              USERS
            </Text>
            {notaccepted.map((item) => (
              <View
                key={item.id}
                className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center justify-between mb-3"
              >
                <TouchableOpacity
                  onPress={() => onUserPress(item)}
                  className="flex-row items-center"
                >
                  <View className="w-14 h-14 rounded-full items-center justify-center">
                    <View className="absolute w-14 h-14 rounded-full bg-blue-400/30 opacity-60 blur-md" />
                    <View className="absolute w-12 h-12 rounded-full bg-blue-400/40 blur-sm" />
                    <Image
                      source={{ uri: item.avatar_url }}
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                  </View>
                  <View className="ml-3">
                    <Text className="text-white text-lg font-semibold">
                      {item.name}
                    </Text>
                    {item.username && (
                      <Text className="text-white/60 text-sm">
                        @{item.username}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {actionComponent?.(item)}
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}
