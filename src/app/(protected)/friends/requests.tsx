import { Stack } from "expo-router";
import { useEffect, useState, useRef } from 'react';
import { View, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FriendRequest } from "@/types";
import FriendRequestModal from "@/components/friendRequestModal";
import FriendRequestsList from "@/components/friendRequestsList";
  

export default function RequestsScreen() {
    const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

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
        } catch (error) {
            console.error('Error', error);
        }
    }

    return (
        <>
        <Stack.Screen/>
        
        <View className="flex-1 bg-black px-4 pt-6">
            <FriendRequestsList onSelect={openModal} />

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
        </View>
    </>
    )

}