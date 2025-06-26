import { useState } from 'react';
import { View } from 'react-native';
import { Profile } from '@/types';
import UserProfileModal from '@/components/userProfileModal';
import { useUser } from '@/components/UserContext';
import AddFriendButton from '@/components/friends/addFriendButton';
import FriendsSearchList from '@/components/friends/friendsSearchList';
import useFriendSearch from '@/hooks/useFriendSearch';

type SearchResult = Profile & { status: 'accepted' | 'pending' | 'none' };

export default function FriendsSearchScreen() {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);

  const { query, results, loading, handleQueryChange, sendFriendRequest } =
    useFriendSearch(user!.id);

  return (
    <View className="flex-1 bg-black px-4 pt-12">
      <FriendsSearchList
        results={results}
        loading={loading}
        onUserPress={(u) => setSelectedUser(u)}
        query={query}
        onChangeQuery={handleQueryChange}
        actionComponent={(u) => (
          <AddFriendButton
            isRequestSent={u.status === 'pending'}
            onPress={() => sendFriendRequest(u.id)}
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
