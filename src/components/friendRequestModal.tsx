import { View, Text, Pressable, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useRef, useEffect } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { FriendRequest } from '@/types';
import FloatingAvatar from '@/components/floatingAvatar';
import { BlurView } from 'expo-blur';

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
}: Props) {
  const modalRef = useRef<Modalize>(null);

  // Only render if request is present
  if (!request) return null;

  useEffect(() => {
    if (visible) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [visible]);

  return (
    <Modalize
      ref={modalRef}
      onClosed={onClose}
      adjustToContentHeight
      modalStyle={{ backgroundColor: 'transparent' }}
      handleStyle={{ backgroundColor: '#ccc' }}
    >
      <BlurView
        intensity={70}
        tint="light"
        className="rounded-2xl px-6 pt-10 pb-6 items-center overflow-visible bg-white/60"
      >
        <ScrollView>
          <View className="items-center justify-center -mt-16 mb-6 relative">
            {request?.sender.avatar_url && (
              <FloatingAvatar uri={request.sender.avatar_url} />
            )}
            <Text className="text-2xl font-bold text-white">
              {request?.sender.name}
            </Text>
            {request?.sender.username && (
              <Text className="text-gray-200">@{request.sender.username}</Text>
            )}
            {request?.sender.bio && (
              <Text className="text-center text-gray-300 mt-2">
                {request.sender.bio}
              </Text>
            )}
          </View>

          <View className="flex-row gap-4 mb-4">
            <Pressable
              onPress={onAccept}
              className="border border-white px-4 py-2 rounded-lg items-center"
            >
              <Text className="text-2xl">✅</Text>
              <Text className="text-white font-medium mt-1">Accept</Text>
            </Pressable>

            <Pressable
              onPress={onReject}
              className="border border-white px-4 py-2 rounded-lg items-center"
            >
              <Text className="text-2xl">❌</Text>
              <Text className="text-white font-medium mt-1">Decline</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => modalRef.current?.close()}
            className="bg-black px-4 py-2 rounded"
          >
            <Text className="text-white">Close</Text>
          </Pressable>
        </ScrollView>
      </BlurView>
    </Modalize>
  );
}
