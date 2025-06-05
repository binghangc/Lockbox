import { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FriendsList from "@/components/friendsList";
import { Profile } from "@/types";
import { useUser } from "@/components/UserContext";
import { BlurView } from 'expo-blur';

export default function InviteFriendsModal({
    tripId,
    visible,
    onClose,
}: {
    tripId: string;
    visible: boolean;
    onClose: () => void;
}) {
    const { user } = useUser();
    const [alreadyInvitedIds, setAlreadyInvitedIds] = useState<string[]>([]);

    const handleInvite = async (participant: Profile) => {
        if (!user || !tripId) return;

        try {
        const token = await AsyncStorage.getItem("access_token");
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/invites/send-invite`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: participant.id, host_id: user.id, trip_id: tripId }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Invite failed:", data.error || data);
            Alert.alert("Invite failed", data.error || "Something went wrong.");
            return;
        }

        setAlreadyInvitedIds((prev) => [...prev, participant.id]);

        } catch (error) {
        console.error("Network error while sending invite:", error);
        }
    };

    const fetchInvited = async () => {
        const token = await AsyncStorage.getItem("access_token");
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/invites/invited?trip_id=${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
            const invitedIds = data.invites.map((invite: any) => invite.user_id);
            setAlreadyInvitedIds(invitedIds);
        } else {
            console.error("Failed to fetch invited users:", data.error);
        }
    };

    useEffect(() => {
        console.log("tripId:", tripId);
        if (visible) {
            fetchInvited();
        }
    }, [visible, tripId]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
        <View className="flex-1 justify-end bg-black/50">
            <BlurView
                intensity={60}
                tint="light"
                className="rounded-t-3xl px-6 pt-6 pb-10 max-h-[80%] min-h-[40%] bg-white/60"
            >
            <Pressable onPress={onClose} className="absolute top-4 right-4">
                <FontAwesome5 name="times" size={18} color="white" />
            </Pressable>

            {/* Optional Grab Bar */}
            <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-5" />

            <Text className="text-lg font-semibold text-white mb-3">Get your friends on board!</Text>
            <FriendsList
                mode="invite"
                onSelect={handleInvite}
                alreadyInvitedIds={alreadyInvitedIds}
            />
            </BlurView>
        </View>
        </Modal>
    );
}
