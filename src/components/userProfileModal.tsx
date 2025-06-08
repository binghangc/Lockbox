import { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { BlurView } from 'expo-blur';
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile } from "@/types"; 
import FloatingAvatar from "./floatingAvatar";
import { Modalize } from "react-native-modalize";
import { ScrollView } from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import AddFriendRow from "@/components/friends/addFriendRow";

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
    const screenHeight = Dimensions.get("window").height;

    const [loading, setLoading] = useState(false);
    const modalRef = useRef<Modalize>(null);

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
                    uid2: user!.id,
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

    useEffect(() => {
      if (isVisible) {
        modalRef.current?.open();
      } else {
        modalRef.current?.close();
      }
    }, [isVisible]);

    if (!user) return null;

    return (
      <Modalize
        ref={modalRef}
        onClosed={onClose}
        modalHeight={screenHeight}
        handlePosition="inside"
        modalStyle={{ backgroundColor: "transparent" }}
        handleStyle={{ backgroundColor: "#ccc" }}
      >
        <BlurView
          intensity={70}
          tint="light"
          className="px-6 pt-10 pb-6 items-center overflow-visible bg-white/60"
          style={{ minHeight: screenHeight }}
        >
          <View className="items-center px-6 pt-12 pb-4">
              {user.avatar_url && <FloatingAvatar uri={user.avatar_url} />}
          </View>

          <ScrollView>
            {/* Username */}
            <Text className="text-gray-400 text-lg font-semibold text-center">@{user.username || 'Username not set'}</Text>

            {/* Name */}
            <View className="w-full mb-2">
              <View className="flex-row items-center justify-center">
                  <Text className="text-white text-2xl font-bold">{user.name || 'Name not set'}</Text>
              </View>     
            </View>
      
            {/* Bio */}
            {user.bio && (
              <View className="w-full mb-4">
                <View className="flex-row items-center justify-center space-x-2">
                  <Text className="text-gray-200 text-lg">{user.bio}</Text>
                </View>
              </View>
            )}

            {!isFriends && (
              <AddFriendRow
                onAddFriend={handleSendFriendRequest}
                onMoreOptions={() => {
                    console.log("More options tapped");
                }}
              />
            )}

            <Pressable
              onPress={() => modalRef.current?.close()}
              className="mt-6 bg-black px-5 py-3 rounded-xl"
            >
              <Text className="text-white text-center">Close</Text>
            </Pressable>
          </ScrollView>
        </BlurView>
      </Modalize>
    );
}
