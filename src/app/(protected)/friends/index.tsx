import { View, Text, Pressable, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useUser } from "@/components/UserContext";
import { useEffect, useState, useRef } from "react";
import { Ionicons, Feather } from '@expo/vector-icons';
import UserProfileModal from "@/components/userProfileModal";
import { Profile, FriendRequest } from "@/types";
import FriendsList from "@/components/friendsList";
import FriendRequestModal from "@/components/friendRequestModal";
import FriendRequestsList from "@/components/friendRequestsList";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FriendsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        listFriendRequests();
    }, [])

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

    if (loading) {
        return (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="white" />
          </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="pl-3">
                            <Feather name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                    title: "Friends",
                    headerRight: () => (
                        <View className="flex-row gap-4 mr-4">
                            <Pressable onPress={() => router.push("/friends/search")}>
                                <Ionicons name="add-outline" size={26} color="white" />
                            </Pressable>
                        </View>
                    ),
                }}
            />
            <View className="flex-1 bg-black px-4 pt-6">
                <View className="mb-6">
                    <Text className="text-s text-gray-400 font-semibold mb-2">
                        FRIEND REQUESTS (0)
                    </Text>

                    <FriendRequestsList 
                        requests={requests}
                        onSelect={openModal} 
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-s text-gray-400 font-semibold mb-2">
                        MY FRIENDS (12)
                    </Text>
                    <FriendsList
                        onSelect={(user) => setSelectedUser(user)}
                    />
                </View>

                <FriendRequestModal
                    visible={modalVisible}
                    request={selectedRequest}
                    onClose={closeModal}
                    onHandled={listFriendRequests}
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