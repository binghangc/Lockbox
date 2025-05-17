import { useRouter, Stack } from "expo-router";
import { useEffect, useState, useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Modal, Pressable, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons"
import { Profile, FriendRequest } from "@/types";
import FriendRequestModal from "@/components/friendRequestModal";
  

export default function RequestsScreen() {
    const router = useRouter();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const listFriendRequests = async () => {
        try {
            setLoading(true);
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
            setRequests(data);
        } catch(error) {
            console.error('Requests error:', 'failed to retrieve requests');
        } finally {
            setLoading(false);
        }
    }

    const openModal = (request: FriendRequest) => {
        setSelectedRequest(request);
        setModalVisible(true);
        scaleAnim.setValue(0);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setSelectedRequest(null);
        });
    };

    const handleFriendRequest = async (
        type: 'accept' | 'reject', 
        id: string,
        uid1: string, 
        uid2: string
    ) => {
        const endpoint = type === 'accept' ? '/accept-request' : '/reject-request';

        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends${endpoint}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${ token }`
                },
                body: JSON.stringify({ id, uid1, uid2 }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                console.error("Error fetching requests:", error);
                return;
            }

            const data = await res.json();
            listFriendRequests();
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
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="white" />
                </View>
            ) : requests.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-base">No friend requests yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => openModal(item)} // sender is the profile of uid1
                          className="bg-zinc-800 p-4 rounded-xl mb-3"
                        >
                          <Text className="text-white text-lg font-semibold">
                            {item.sender?.username || 'Unknown'}
                          </Text>
                        </TouchableOpacity>
                      )}
                />
            )}
        </View>

        <FriendRequestModal
            visible={modalVisible}
            request={selectedRequest}
            onClose={closeModal}
            onAccept={() => {
                if (!selectedRequest) return;
                handleFriendRequest("accept", selectedRequest!.id, selectedRequest!.uid1, selectedRequest!.uid2);
                closeModal();
            }}
            onReject={() => {
                if (!selectedRequest) return;
                handleFriendRequest("reject", selectedRequest!.id, selectedRequest!.uid1, selectedRequest!.uid2);
                closeModal();
            }}
            scaleAnim={scaleAnim}
        />
    </>
    )

}