import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Alert, View } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modalize } from 'react-native-modalize';

import InviteFriendsModal from '@/components/invites/inviteFriendsModal';
import TripControllerModal from '@/components/tripControllerModal';

import useTrips from '@/hooks/useTrips';
import usePinTrip from '@/hooks/usePinTrip';
import createCalendarEvent from '@/utils/calendarEvent';
import { useTripTheme, TripThemeProvider } from '@/context/TripThemeProvider';

type TripLayoutInnerProps = {
  tripId: string;
  isHost: boolean;
  isPinned: boolean;
  trip: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    video_background?: string | null;
  };
  pinTrip: () => void;
  modalRef: React.RefObject<Modalize>;
  inviteModalRef: React.RefObject<Modalize>;
};

function TripLayoutInner({
  tripId,
  isHost,
  isPinned,
  trip,
  pinTrip,
  modalRef,
  inviteModalRef,
}: TripLayoutInnerProps) {
  const theme = useTripTheme();
  const router = useRouter();

  const onEdit = () => {
    router.push(`/tripForm?mode=edit&tripId=${tripId}`);
    modalRef.current?.close();
  };

  const onSync = async () => {
    try {
      await createCalendarEvent({
        title: trip.title,
        startDate: trip.start_date,
        endDate: trip.end_date,
        notes: trip.description ?? 'Synced from Lockbox',
      });
      Alert.alert('Success', 'Trip added to your calendar!');
    } catch (err) {
      console.error('Calendar sync failed:', err);
      Alert.alert('Error', 'Unable to add to calendar.');
    }
  };

  const onPin = () => {
    pinTrip();
    modalRef.current?.close();
  };

  const onInvite = () => {
    modalRef.current?.close();
    router.push(`/trips/${tripId}/sendInvites`);
  };

  const onDelete = () => {};
  const onLeave = () => {};

  const headerBackground = () => (
    <View
      style={{
        backgroundColor: 'transparent',
        ...StyleSheet.absoluteFillObject,
      }}
    />
  );

  return (
    <>
      <Stack
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerTransparent: true,
          headerTintColor: theme.primaryText,
          headerTitleAlign: 'center',
          title: '',
          headerBackground,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginLeft: 12,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Octicons
                name="chevron-left"
                size={28}
                color={theme.primaryIcon}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => modalRef.current?.open()}
              style={{
                marginRight: 12,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={28}
                color={theme.primaryIcon}
              />
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen
          name="[tripId]/itinerary"
          options={{
            presentation: 'modal',
            title: 'Trip Itinerary',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            headerShown: true,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Stack>

      <TripControllerModal
        triggerRef={modalRef}
        isHost={isHost}
        isPinned={isPinned}
        onEdit={onEdit}
        onSync={onSync}
        onPin={onPin}
        onInvite={onInvite}
        onDelete={onDelete}
        onLeave={onLeave}
      />

      <InviteFriendsModal ref={inviteModalRef} tripId={tripId} />
    </>
  );
}

export default function TripsLayout() {
  const modalRef = useRef<Modalize>(null!);
  const inviteModalRef = useRef<Modalize>(null!);
  const { tripId } = useLocalSearchParams();
  const { trip, isHost, loading, isPinned, refreshTrip } = useTrips(
    Array.isArray(tripId) ? tripId[0] : tripId,
  );

  const pinTrip = usePinTrip(trip?.id ?? '', refreshTrip);

  if (loading || !trip) return null;

  return (
    <TripThemeProvider videoKey={trip.video_background ?? 'default'}>
      <TripLayoutInner
        tripId={Array.isArray(tripId) ? tripId[0] : tripId}
        isHost={isHost}
        isPinned={isPinned}
        trip={trip}
        pinTrip={pinTrip}
        modalRef={modalRef}
        inviteModalRef={inviteModalRef}
      />
    </TripThemeProvider>
  );
}
