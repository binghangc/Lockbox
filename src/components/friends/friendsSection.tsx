import { useState } from "react";
import { View, Text } from "react-native";
import { useUser } from "@/components/UserContext";
import { Profile } from "@/types";
import FriendsList from "@/components/friendsList";
import UserProfileModal from "@/components/userProfileModal";

export default function FriendsSection() {
    const { user } = useUser();
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    return (
        <>
            <View className="mb-6">
                <Text className="text-s text-gray-400 font-semibold mb-2">
                    MY FRIENDS
                </Text>
                <FriendsList onSelect={(user) => setSelectedUser(user)} />
            </View>
            <UserProfileModal
                isVisible={selectedUser !== null}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                currentUserId={user?.id}
                isFriends={true}
            />
        </>
    );
}