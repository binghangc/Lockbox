import { useState } from 'react';
import { View } from 'react-native';
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

  return (
    <View className="flex-1 bg-black px-4 pt-12">
      <FriendsSearchList
        onUserPress={(u) => setSelectedUser(u)}
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
