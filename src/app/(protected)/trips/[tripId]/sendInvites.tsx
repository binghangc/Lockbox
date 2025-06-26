import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import useFriends from '@/hooks/useFriends';
import { debounce } from 'lodash';
import { FontAwesome5 } from '@expo/vector-icons';
import InviteFriendsList from '@/components/invites/inviteFriendsList';
import { useUser } from '@/components/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo } from 'react';
import { Profile } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SendInvitesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [alreadyInvitedIds, setAlreadyInvitedIds] = useState<string[]>([]);
  const insets = useSafeAreaInsets();

  const { friends, loading } = useFriends();
  const [query, setQuery] = useState('');
  const [rawQuery, setRawQuery] = useState('');
  const [inviteStatus, setInviteStatus] = useState<
    Record<string, 'idle' | 'loading' | 'sent' | 'failed'>
  >({});

  const debouncedUpdate = useMemo(
    () => debounce((text: string) => setQuery(text), 300),
    [],
  );

  const handleSearchChange = (text: string) => {
    setRawQuery(text);
    debouncedUpdate(text);
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.username?.toLowerCase() ?? '').includes(query.toLowerCase()),
  );

  useEffect(() => {
    const updatedStatus = alreadyInvitedIds.reduce(
      (acc, id) => {
        acc[id] = 'sent';
        return acc;
      },
      {} as Record<string, 'sent'>,
    );
    setInviteStatus(updatedStatus);
  }, [alreadyInvitedIds]);

  const handleInvite = async (participant: Profile) => {
    if (!user || !tripId) return;

    setInviteStatus((prev) => ({ ...prev, [participant.id]: 'loading' }));

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
        return;
      }

      setInviteStatus((prev) => ({ ...prev, [participant.id]: 'sent' }));
      setAlreadyInvitedIds((prev) => [...prev, participant.id]);
    } catch (err) {
      console.error('Error sending invite:', err);
      setInviteStatus((prev) => ({ ...prev, [participant.id]: 'failed' }));
    }
  };

  useEffect(() => {
    const fetchInvited = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/invites/invited?trip_id=${tripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (res.ok) {
        setAlreadyInvitedIds(
          data.invites.map((i: { user_id: string }) => i.user_id),
        );
      } else {
        console.error('Failed to fetch invited users:', data.error);
      }
    };

    if (tripId) fetchInvited();
  }, [tripId]);

  return (
    <View
      className="flex-1 bg-neutral-950 px-5"
      style={{ paddingTop: insets.top + 12 }}
    >
      <Pressable onPress={router.back} className="mb-4">
        <FontAwesome5 name="chevron-left" size={18} color="white" />
      </Pressable>

      <Text className="text-white text-2xl font-semibold mb-4">
        Get your friends on board!
      </Text>

      <InviteFriendsList
        friends={filteredFriends}
        rawQuery={rawQuery}
        onQueryChange={handleSearchChange}
        inviteStatus={inviteStatus}
        alreadyInvitedIds={alreadyInvitedIds}
        onSelect={handleInvite}
        loading={loading}
      />
    </View>
  );
}
