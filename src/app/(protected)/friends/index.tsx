import { View, Text, Pressable, TouchableOpacity, FlatList, Image } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useUser } from "@/components/UserContext";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from '@expo/vector-icons';
import UserProfileModal from "@/components/userProfileModal";
import { Profile } from "@/types";
import FriendsList from "@/components/friendsList";

type FriendRow = Profile & { friendshipId: string };

export default function FriendsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [friends, setFriends] = useState<FriendRow[]>([]);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const listFriends = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access_token");
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const { error } = await res.json();
                console.error("Error fetching friends:", error);
                return;
            }

            const data = await res.json();
            setFriends(data)
        } catch (error) {
            console.error('Friends error:', 'failed to retrieve friends');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        listFriends();
    }, [])

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
                    friends={friends}
                    loading={loading}
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