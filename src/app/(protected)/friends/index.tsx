import { View, Pressable, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useUser } from "@/components/UserContext";
import { useEffect, useState } from "react";
import { Ionicons, Feather } from '@expo/vector-icons';
import UserProfileModal from "@/components/userProfileModal";
import { Profile } from "@/types";
import FriendsList from "@/components/friendsList";

type FriendRow = Profile & { friendshipId: string };

export default function FriendsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Friends",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="pl-3">
                            <Feather name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View className="flex-row gap-4 mr-4">
                            <Pressable onPress={() => router.push("/friends/search")}>
                                <Ionicons name="add-outline" size={26} color="white" />
                            </Pressable>
                            <Pressable onPress={() => router.push("/friends/requests")}>
                                <Ionicons name="mail-outline" size={22} color="white" />
                            </Pressable>
                        </View>
                    ),
                }}
            />
            <View className="flex-1 bg-black px-4 pt-6">
                <FriendsList
                    onSelect={(user) => setSelectedUser(user)}
                />
    
                <UserProfileModal
                    isVisible={selectedUser !== null}
                    onClose={() => setSelectedUser(null)}
                    user={selectedUser}
                    currentUserId={user?.id}
                    isFriends={true}
                />
            </View>
        </>
    );
}