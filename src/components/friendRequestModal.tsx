import { View, Text, Pressable, Animated } from "react-native";
import { Profile } from "@/types";

type Props = {
  visible: boolean;
  user: Profile | null;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  scaleAnim: Animated.Value;
};

export default function FriendRequestModal({ 
    visible, 
    user, 
    onClose, 
    onAccept,
    onDecline,
    scaleAnim 
}: Props) {
  if (!visible || !user) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/50">
        <Animated.View
            style={{ transform: [{ scale: scaleAnim }] }}
            className="w-72 h-72 bg-white rounded-2xl justify-center items-center px-4"
        >
        <Text className="text-black text-xl font-bold mb-2">{user.username}</Text>
        <Text className="text-black mb-4">{user.bio || "No bio provided."}</Text>

        <View className="flex-row gap-4 mb-4">
            <Pressable onPress={onAccept} className="bg-green-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Accept</Text>
            </Pressable>
            <Pressable onPress={onDecline} className="bg-red-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Decline</Text>
            </Pressable>
        </View>

        <Pressable onPress={onClose} className="bg-black px-4 py-2 rounded">
            <Text className="text-white">Close</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
