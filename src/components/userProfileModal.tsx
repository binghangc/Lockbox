import { useState } from "react";
import { View, Text, Image, Pressable, Alert } from "react-native";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile } from "@/types"; // update this path as needed

export default function UserProfileModal({
    isVisible,
    onClose,
    user,
    currentUserId,
    isFriends
}: {
    isVisible: boolean;
    onClose: () => void;
    user: Profile | null;
    currentUserId: string;
    isFriends: boolean;
}) {
    const [loading, setLoading] = useState(false);

    if (!user) return null;
    
    const handleSendFriendRequest = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");

            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/send-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    uid1: currentUserId,
                    uid2: user.id,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Something went wrong");
            }

            Alert.alert("Request Sent", result.message);
            onClose();
        } catch (error: any) {
            console.error("Friend request error:", error.message);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            backdropOpacity={0.6}
            useNativeDriver
        >
        <View className="bg-white rounded-2xl p-6 items-center">
            {user.avatar_url && (
                <Image
                    source={{ uri: user.avatar_url }}
                    className="w-24 h-24 rounded-full mb-4"
                />
            )}
            <Text className="text-xl font-bold">{user.username}</Text>
            {user.name && (
                <Text className="text-gray-500">{user.name}</Text>
            )}
            {user.bio && (
                <Text className="text-center text-gray-600 mt-2">{user.bio}</Text>
            )}

            {!isFriends && (
                <Pressable
                    onPress={handleSendFriendRequest}
                    disabled={loading}
                    className="mt-6 bg-blue-600 px-5 py-3 rounded-xl"
                >
                    <Text className="text-white text-center">
                        {loading ? "Sending..." : "Add Friend"}
                    </Text>
                </Pressable>
            )}
            
            <Pressable
                onPress={onClose}
                className="mt-6 bg-black px-5 py-3 rounded-xl"
            >
                <Text className="text-white text-center">Close</Text>
            </Pressable>
        </View>
        </Modal>
    );
}
