/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import useFriends from '@/hooks/useFriends';
import { debounce } from 'lodash';
import InviteFriendsList from '@/components/invites/inviteFriendsList';
import { useUser } from '@/context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo } from 'react';
import { Profile, Trip } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import { BlurView } from 'expo-blur';
import { useTripTheme, TripThemeProvider } from '@/context/TripThemeProvider';
import useTrips from '@/hooks/useTrips';

function SendInvitesContent({ trip }: { trip: Trip }) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const bgKey = trip?.video_background ?? null;

  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [alreadyInvitedIds, setAlreadyInvitedIds] = useState<string[]>([]);

  const { friends, loading } = useFriends();
  const [query, setQuery] = useState('');
  const [rawQuery, setRawQuery] = useState('');
  const [inviteStatus, setInviteStatus] = useState<
    Record<
      string,
      'idle' | 'loading' | 'pending' | 'accepted' | 'declined' | 'failed'
    >
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

      setInviteStatus((prev) => ({ ...prev, [participant.id]: 'pending' }));
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
        interface Invite {
          user_id: string;
          status:
            | 'idle'
            | 'loading'
            | 'pending'
            | 'accepted'
            | 'declined'
            | 'failed';
        }

        interface InvitedResponse {
          invites: Invite[];
        }

        const newStatusMap = (data as InvitedResponse).invites.reduce(
          (
            acc: Record<string, Invite['status']>,
            { user_id, status }: Invite,
          ) => {
            acc[user_id] = status;
            return acc;
          },
          {} as Record<string, Invite['status']>,
        );

        setInviteStatus(newStatusMap);
        setAlreadyInvitedIds(Object.keys(newStatusMap));
      } else {
        console.error('Failed to fetch invited users:', data.error);
      }
    };

    if (tripId) fetchInvited();
  }, [tripId]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: 'Invite Friends',
          headerTitleStyle: {
            color: theme.primaryText,
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackground: () => (
            <BlurView
              intensity={60}
              tint={theme.blurTint as 'light' | 'dark'}
              experimentalBlurMethod="none"
              style={{
                flex: 1,
                backgroundColor:
                  Platform.OS === 'android'
                    ? `${theme.secondaryBackground}EE`
                    : undefined,
              }}
            />
          ),
        }}
      />
      <TripVisualBackground videoKey={bgKey} effectKey={null} />
      <BlurView
        intensity={60}
        tint={theme.blurTint as 'light' | 'dark' | 'default'}
        experimentalBlurMethod="dimezisBlurView"
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 40,
            backgroundColor: 'transparent',
          }}
        >
          <View style={{ flex: 1, paddingTop: 15 }}>
            <InviteFriendsList
              friends={filteredFriends}
              rawQuery={rawQuery}
              onQueryChange={handleSearchChange}
              inviteStatus={inviteStatus}
              alreadyInvitedIds={alreadyInvitedIds}
              onSelect={handleInvite}
              loading={loading}
              searchInputStyle={{ paddingHorizontal: 10 }}
            />
          </View>
        </View>
      </BlurView>
    </>
  );
}

export default function SendInvitesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);
  const videoKey = trip?.video_background || 'moonlight';

  return (
    <TripThemeProvider videoKey={videoKey}>
      {trip && (
        <SendInvitesContent
          trip={{
            ...trip,
            description: trip.description ?? '',
          }}
        />
      )}
    </TripThemeProvider>
  );
}
