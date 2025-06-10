import { useState } from 'react';
import { View, Text } from 'react-native';
import { useUser } from '@/components/UserContext';
import { Profile } from '@/types';
import FriendsList from '@/components/friends/friendsList';
import UserProfileModal from '@/components/userProfileModal';

export default function FriendsSection() {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [friendCount, setFriendCount] = useState(0);

  return (
    <>
      <View className="mb-6 flex-1">
        <Text className="text-s text-gray-400 font-semibold mb-2">
          MY FRIENDS ({friendCount})
        </Text>
        <FriendsList
          onSelect={(selectedFriend) => setSelectedUser(selectedFriend)}
          onCountUpdate={setFriendCount}
        />
      </View>
      <UserProfileModal
        isVisible={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        currentUserId={user?.id}
        isFriends
      />
    </>
  );
}
