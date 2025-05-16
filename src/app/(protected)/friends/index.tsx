import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useUser } from "@/components/UserContext";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from '@expo/vector-icons';

export default function FriendsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [friends, setFriends] = useState([]);

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
            setFriends(data.friends)
            console.log("Friends list:", data.friends);
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
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg">Friends Screen</Text>
            </View>
        </>
    );
}