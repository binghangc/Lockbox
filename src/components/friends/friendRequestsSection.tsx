import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FriendRequestsList from "@/components/friendRequestsList";
import FriendRequestModal from "@/components/friendRequestModal";
import { FriendRequest } from "@/types";

export default function FriendRequestsSection() {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
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
            },
        });

        if (!res.ok) {
            const { error } = await res.json();
            console.error("Error fetching requests:", error);
            return;
        }

        const data = await res.json();
        setRequests(data);
        } catch (error) {
        console.error("Requests error:", "failed to retrieve requests");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        listFriendRequests();
    }, []);

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

    return (
        <>
            <View className="mb-6">
                <Text className="text-s text-gray-400 font-semibold mb-2">
                    FRIEND REQUESTS ({requests.length})
                </Text>
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : requests.length === 0 ? (
                    <Text className="text-gray-400 text-base text-center mt-2">
                      No friend requests.
                    </Text>
                ) : (
                    <FriendRequestsList requests={requests} onSelect={openModal} />
                )}
            </View>
            <FriendRequestModal
                visible={modalVisible}
                request={selectedRequest}
                onClose={closeModal}
                onHandled={listFriendRequests}
            />
        </>
    );
}