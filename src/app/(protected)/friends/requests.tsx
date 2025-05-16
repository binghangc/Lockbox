import { useRouter, Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Modal, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import { Ionicons, Feather } from "@expo/vector-icons"
import FormInput from "@/components/formInput";

export default function RequestsScreen() {
    const router = useRouter();
    const [requests, setRequests] = useState([]);

    const listFriendRequests = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/requests`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!res.ok) {
                const { error } = await res.json();
                console.error("Error fetching requests:", error);
                return;
            }

            const data = await res.json();
            setRequests(data.requests);
        } catch(error) {
            console.error('Requests error:', 'failed to retrieve requests');
        }
    }

    const handleFriendRequest = async (type: 'accept' | 'decline') => {
        const endpoint = type === 'accept' ? '/accept-request' : '/decline-request';

        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${ token }`
                },
                body: JSON.stringify({ }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                console.error("Error fetching requests:", error);
                return;
            }

            const data = await res.json();
        } catch (error) {
            console.error('Error', error);
        }
    }
    
    useEffect(() => {
        listFriendRequests();
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
    )
    

}