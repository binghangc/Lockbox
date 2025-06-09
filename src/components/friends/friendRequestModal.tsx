import { View, Text, Pressable, Animated, Alert, Dimensions } from "react-native";
import { Modalize } from "react-native-modalize";
import { useRef, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { FriendRequest } from "@/types";
import FloatingAvatar from "@/components/floatingAvatar";
import { BlurView } from 'expo-blur';
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  visible: boolean;
  request: FriendRequest | null;
  onClose: () => void;
  onHandled: () => void;
};

export default function FriendRequestModal({ 
  visible, 
  request, 
  onClose, 
  onHandled
}: Props) {
  const modalRef = useRef<Modalize>(null);
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (visible) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [visible]);

  // Only render if request is present
  if (!request) return null;

  const handleFriendRequest = async (
      type: 'accept' | 'reject'
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
              body: JSON.stringify({ 
                id: request.id, 
                uid1: request.uid1, 
                uid2: request.uid2 
              }),
          });

          if (!res.ok) {
              const { error } = await res.json();
              console.error("Error fetching requests:", error);
              Alert.alert("Error", error || "Something went wrong.");
              return;
          }

          onClose();
          onHandled();
      } catch (error) {
          console.error('Error', error);
          Alert.alert("Error", "Unable to process request.");
      }
  }

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
          {request?.sender.avatar_url && <FloatingAvatar uri={request.sender.avatar_url} />}
        </View>
        <ScrollView>
          {/* Username */}
          {request?.sender.username && (
            <Text className="text-gray-400 text-lg font-semibold text-center">@{request.sender.username}</Text>
          )}

          {/* Name */}
          <View className="w-full mb-2">
            <View className="flex-row items-center justify-center">
                <Text className="text-white text-2xl font-bold">{request?.sender.name}</Text>
            </View>     
          </View>
    
          {/* Bio */}
          {request?.sender.bio  && (
            <View className="w-full mb-4">
              <View className="flex-row items-center justify-center space-x-2">
                <Text className="text-gray-200 text-lg">{request.sender.bio}</Text>
              </View>
            </View>
          )}

          <View className="flex-row gap-4 mb-4">
            <Pressable onPress={() => handleFriendRequest("accept")} className="border border-white px-6 py-4 rounded-lg items-center">
              <Text className="text-2xl">✅</Text>
              <Text className="text-white font-medium mt-1">Accept</Text>
            </Pressable>

            <Pressable onPress={() => handleFriendRequest("reject")} className="border border-white px-6 py-4 rounded-lg items-center">
              <Text className="text-2xl">❌</Text>
              <Text className="text-white font-medium mt-1">Decline</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => modalRef.current?.close()} className="mt-6 bg-black px-5 py-3 rounded-xl">
            <Text className="text-white text-center">Close</Text>
          </Pressable>
        </ScrollView>
      </BlurView>
    </Modalize>
  );
}
