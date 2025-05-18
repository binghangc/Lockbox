import { View, Text, Pressable, TouchableOpacity, FlatList, Image } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useUser } from "@/components/UserContext";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from '@expo/vector-icons';
import UserProfileModal from "@/components/userProfileModal";
import { Profile } from "@/types"

type FriendRow = Profile & { friendshipId: string };

export default function FriendsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [friends, setFriends] = useState<FriendRow[]>([]);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    const listFriends = async () => {
        try {
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
                        <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-6 z-10">
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
                {friends.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-white text-center text-base mb-3">
                            You haven’t added anyone yet. Start connecting with fellow explorers!
                        </Text>
                        <Pressable
                            onPress={() => router.push("/friends/search")}
                            className="bg-blue-600 px-6 py-3 rounded-xl"
                        >
                            <Text className="text-white text-center font-semibold">Find Friends</Text>
                        </Pressable>
                    </View>
                ) : ( 
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.id}
                        className="mt-4"
                        renderItem={({ item }: { item: FriendRow }) => (
                            <TouchableOpacity
                                className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
                                onPress={() => setSelectedUser(item)}
                            >
                                <View className="w-14 h-14 rounded-full items-center justify-center">
                                    {/* Glow layer */}
                                    <View className="absolute w-14 h-14 rounded-full bg-blue-400/30 opacity-60 blur-md" />
                                    <View className="absolute w-12 h-12 rounded-full bg-blue-400/40 blur-sm" />
                                    
                                    {/* Avatar image */}
                                    <Image
                                        source={{ uri: item.avatar_url }}
                                        className="w-12 h-12 rounded-full border-2 border-white"
                                    />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white text-lg font-semibold">{item.name}</Text>
                                    {item.username && (
                                        <Text className="text-white/60 text-sm">@{item.username}</Text>
                                    )}
                                </View>
                                <Pressable
                                    onPress={() => setSelectedUser(item)}
                                    className="px-3 py-1 bg-blue-600 rounded-full"
                                    >
                                    <Text className="text-white text-sm">Nudge</Text>
                                </Pressable>
                            </TouchableOpacity>
        
                        )}
                    />
                )}
    
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