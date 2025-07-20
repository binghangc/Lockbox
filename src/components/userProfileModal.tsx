import { useTripTheme } from '@/context/TripThemeProvider';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile } from '@/types';
import { Modalize } from 'react-native-modalize';
import { ScrollView } from 'react-native-gesture-handler';
import AddFriendRow from '@/components/friends/addFriendRow';
import FloatingAvatar from './floatingAvatar';

export default function UserProfileModal({
  isVisible,
  onClose,
  user,
  currentUserId,
  isFriends,
  status,
}: {
  isVisible: boolean;
  onClose: () => void;
  user: Profile | null;
  currentUserId: string;
  isFriends: boolean;
  status?: 'accepted' | 'pending' | 'incoming' | 'none';
}) {
  const screenHeight = Dimensions.get('window').height;

  const [loading, setLoading] = useState(false);
  const modalRef = useRef<Modalize>(null);
  const theme = useTripTheme();

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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      console.error('Friend request error:', message);
      Alert.alert('Error', message);
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
      handlePosition="inside"
      modalStyle={{
        backgroundColor: theme.secondaryBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
      }}
      withHandle={false}
    >
      <BlurView
        intensity={30}
        tint={theme.blurTint as 'light' | 'dark'}
        experimentalBlurMethod="dimezisBlurView"
        className="px-6 pt-10 pb-6 items-center overflow-visible"
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          minHeight: screenHeight * 0.5,
          backgroundColor:
            Platform.OS === 'android'
              ? `${theme.secondaryBackground}AA`
              : 'transparent',
        }}
      >
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: '#bbb',
            alignSelf: 'center',
            marginBottom: 12,
          }}
        />
        <View className="items-center px-6 pt-8 pb-4">
          {user.avatar_url && <FloatingAvatar uri={user.avatar_url} />}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text
            style={{ color: theme.optionalText }}
            className="text-lg font-semibold text-center mb-1"
          >
            @{user.username || 'Username not set'}
          </Text>
          <Text
            style={{ color: theme.primaryText }}
            className="text-2xl font-bold text-center mb-4"
          >
            {user.name || 'Name not set'}
          </Text>

          {user.bio && (
            <Text
              style={{ color: theme.secondaryText }}
              className="text-center text-base px-3 mb-6"
            >
              {user.bio}
            </Text>
          )}

          {!isFriends &&
            (loading ? (
              <View className="my-4 items-center">
                <ActivityIndicator size="small" color={theme.primaryText} />
              </View>
            ) : (
              <AddFriendRow
                onAddFriend={handleSendFriendRequest}
                onMoreOptions={() => console.log('More options tapped')}
                status={status}
              />
            ))}

          <Pressable
            onPress={() => modalRef.current?.close()}
            style={{
              marginTop: 24,
              backgroundColor: theme.primaryText,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              alignSelf: 'center',
              width: 128,
            }}
          >
            <Text style={{ color: theme.background, textAlign: 'center' }}>
              Close
            </Text>
          </Pressable>
        </ScrollView>
      </BlurView>
    </Modalize>
  );
}
