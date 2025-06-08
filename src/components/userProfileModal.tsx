import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile } from '@/types';
import { Modalize } from 'react-native-modalize';
import { ScrollView } from 'react-native-gesture-handler';
import FloatingAvatar from './floatingAvatar';

export default function UserProfileModal({
  isVisible,
  onClose,
  user,
  currentUserId,
  isFriends,
}: {
  isVisible: boolean;
  onClose: () => void;
  user: Profile | null;
  currentUserId: string;
  isFriends: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<Modalize>(null);

  const handleSendFriendRequest = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/friends/send-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid1: currentUserId,
            uid2: user!.id,
          }),
        },
      );

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      Alert.alert('Request Sent', result.message);
      onClose();
    } catch (error: any) {
      console.error('Friend request error:', error.message);
      Alert.alert('Error', error.message);
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
            {user.avatar_url && <FloatingAvatar uri={user.avatar_url} />}
          </View>

          <Text className="text-xl font-bold text-white">{user.name}</Text>
          {user.username && (
            <Text className="text-gray-200">@{user.username}</Text>
          )}
          {user.bio && (
            <Text className="text-center text-gray-300 mt-2">{user.bio}</Text>
          )}

          {!isFriends && (
            <Pressable
              onPress={handleSendFriendRequest}
              disabled={loading}
              className="mt-6 bg-blue-600 px-5 py-3 rounded-xl"
            >
              <Text className="text-white text-center">
                {loading ? 'Sending...' : 'Add Friend'}
              </Text>
            </Pressable>
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
