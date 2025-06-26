import { useState } from 'react';
import { View } from 'react-native';
import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/types';
import UserProfileModal from '@/components/userProfileModal';
import { useUser } from '@/components/UserContext';
import AddFriendButton from '@/components/friends/addFriendButton';
import FriendsSearchList from '@/components/friends/friendsSearchList';

type SearchResult = Profile & { status: 'accepted' | 'pending' | 'none' };

export default function FriendsSearchScreen() {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/friends/send-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid1: user!.id,
            uid2: targetUserId,
          }),
        },
      );

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
      // Optimistically update the user's status in the results list
      setResults((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, status: 'pending' } : u,
        ),
      );
    } catch (error) {
      console.error('Friend request error:', error.message);
    }
  };

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

  return (
    <View className="flex-1 bg-black px-4 pt-12">
      <FriendsSearchList
        results={results}
        loading={loading}
        onUserPress={(u) => setSelectedUser(u)}
        query={query}
        onChangeQuery={handleChange}
        actionComponent={(u) => (
          <AddFriendButton
            isRequestSent={u.status === 'pending'}
            onPress={() => handleSendFriendRequest(u.id)}
          />
        )}
      />
      <UserProfileModal
        isVisible={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        currentUserId={user?.id}
        isFriends={selectedUser?.status === 'accepted'}
        status={selectedUser?.status}
      />
    </View>
  );
}
