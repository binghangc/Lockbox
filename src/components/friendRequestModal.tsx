import { View, Text, Pressable, Animated } from "react-native";
import Modal from "react-native-modal";
import { FriendRequest } from "@/types";
import FloatingAvatar from "@/components/floatingAvatar";
import { BlurView } from 'expo-blur';;

type Props = {
  visible: boolean;
  request: FriendRequest | null;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  scaleAnim: Animated.Value;
};

export default function FriendRequestModal({ 
    visible, 
    request, 
    onClose, 
    onAccept,
    onReject,
    scaleAnim 
}: Props) {
  if (!visible || !request) return null;

  return (
    <Modal
    isVisible={visible}
    onBackdropPress={onClose}
    animationIn="zoomIn"
    animationOut="zoomOut"
    backdropOpacity={0.6}
    useNativeDriver
  >
        <BlurView
            intensity={70}
            tint="light"
            className="rounded-2xl px-6 pt-10 pb-6 items-center overflow-visible bg-white/60"
        >

          <View className="items-center justify-center -mt-16 mb-6 relative">
              {request.sender.avatar_url && <FloatingAvatar uri={request.sender.avatar_url} />}
          </View>
        <Text className="text-white text-xl font-bold mb-2">{request.sender.username}</Text>
        <Text className="text-white mb-4">{request.sender.bio || "No bio provided."}</Text>

        <View className="flex-row gap-4 mb-4">
            <Pressable onPress={onAccept} className="bg-green-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Accept</Text>
            </Pressable>
            <Pressable onPress={onReject} className="bg-red-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Decline</Text>
            </Pressable>
        </View>

        <Pressable onPress={onClose} className="bg-black px-4 py-2 rounded">
            <Text className="text-white">Close</Text>
        </Pressable>
      </BlurView>
      </Modal>
  );
}
