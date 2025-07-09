import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modalize } from 'react-native-modalize';
import InviteFriendsList from '@/components/invites/inviteFriendsList';
import { Profile } from '@/types';
import { useUser } from '@/context/UserContext';
import { BlurView } from 'expo-blur';

const InviteFriendsModal = forwardRef<Modalize, { tripId: string }>(
  ({ tripId }, ref) => {
    const { user } = useUser();
    const modalRef = useRef<Modalize>(null);
    const [alreadyInvitedIds, setAlreadyInvitedIds] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }));

    const handleInvite = async (participant: Profile) => {
      if (!user || !tripId) return;

      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/invites/send-invite`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: participant.id,
              host_id: user.id,
              trip_id: tripId,
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.error('Invite failed:', data.error || data);
          Alert.alert('Invite failed', data.error || 'Something went wrong.');
          return;
        }

        setAlreadyInvitedIds((prev) => [...prev, participant.id]);
      } catch (error) {
        console.error('Network error while sending invite:', error);
      }
    };

    useEffect(() => {
      const fetchInvited = async () => {
        if (!tripId) return;

        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/invites/invited?trip_id=${tripId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();

        interface Invite {
          user_id: string;
        }

        if (res.ok) {
          const invitedIds = data.invites.map(
            (invite: Invite) => invite.user_id,
          );
          setAlreadyInvitedIds(invitedIds);
        } else {
          console.error('Failed to fetch invited users:', data.error);
        }
      };

      fetchInvited();
    }, [tripId]);

    return (
      <Modalize
        ref={modalRef}
        adjustToContentHeight
        modalStyle={{ backgroundColor: 'transparent' }}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        handlePosition="inside"
        handleStyle={{ backgroundColor: '#999', width: 40, height: 5 }}
      >
        <BlurView
          intensity={60}
          tint="light"
          className="rounded-t-3xl px-6 pt-6 pb-10 bg-white/60"
        >
          <Pressable
            onPress={() => modalRef.current?.close()}
            className="absolute top-4 right-4"
          >
            <FontAwesome5 name="times" size={18} color="white" />
          </Pressable>

          <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-5" />

          <Text className="text-lg font-semibold text-white mb-3">
            Get your friends on board!
          </Text>

          <InviteFriendsList
            mode="invite"
            onSelect={handleInvite}
            alreadyInvitedIds={alreadyInvitedIds}
          />
        </BlurView>
      </Modalize>
    );
  },
);
InviteFriendsModal.displayName = 'InviteFriendsModal';

export default InviteFriendsModal;
