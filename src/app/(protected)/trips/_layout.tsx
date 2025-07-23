import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Alert, View, Text } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';

import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InviteFriendsModal from '@/components/invites/inviteFriendsModal';
import TripControllerModal from '@/components/tripControllerModal';

import useTrips from '@/hooks/useTrips';
import usePinTrip from '@/hooks/usePinTrip';
import createCalendarEvent from '@/utils/calendarEvent';
import { useTripTheme, TripThemeProvider } from '@/context/TripThemeProvider';
import useItineraries from '@/hooks/useItineraries';
import getTripDays from '@/utils/date';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type TripLayoutInnerProps = {
  tripId: string;
  isHost: boolean;
  isPinned: boolean;
  isDisabled: boolean;
  trip: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    video_background?: string | null;
    status: 'upcoming' | 'ongoing' | 'ended';
  };
  pinTrip: () => void;
  modalRef: React.RefObject<Modalize>;
  inviteModalRef: React.RefObject<Modalize>;
};

function TripLayoutInner({
  tripId,
  isHost,
  isPinned,
  isDisabled,
  trip,
  pinTrip,
  modalRef,
  inviteModalRef,
}: TripLayoutInnerProps) {
  const theme = useTripTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onEdit = () => {
    router.push(`/tripForm?mode=edit&tripId=${tripId}`);
    modalRef.current?.close();
  };

  const onItinerary = () => {
    modalRef.current?.close();
    router.push(`trips/${tripId}/itinerary`);
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
                marginTop: insets.top + 4,
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
                marginTop: insets.top + 4,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              hitSlop={{ top: 15, bottom: 20, left: 15, right: 15 }}
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
            headerTitle: () => (
              <Text
                style={{
                  marginTop: insets.top + 4,
                  fontSize: 18,
                  fontWeight: '600',
                  color: tintColor,
                }}
              >
                Trip Itinerary
              </Text>
            ),
            animation: 'slide_from_bottom',
            gestureEnabled: !isDisabled,
            headerShown: true,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            headerLeft: ({ tintColor }) => {
              if (isDisabled) return null;

              return (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    marginLeft: 12,
                    marginTop: insets.top + 4,
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  hitSlop={{ top: 15, bottom: 20, left: 15, right: 15 }}
                >
                  <Octicons name="chevron-left" size={28} color={tintColor} />
                </TouchableOpacity>
              );
            },
          }}
        />
        <Stack.Screen
          name="[tripId]/vault"
          options={{
            title: 'Vault',
            headerTitle: () => (
              <Text
                style={{
                  marginTop: insets.top + 4,
                  fontSize: 18,
                  fontWeight: '600',
                  color: tintColor,
                }}
              >
                Vault
              </Text>
            ),
            animation: 'default',
            gestureEnabled: true,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="[tripId]/participants"
          options={{
            title: 'Participants',
            headerTitle: () => (
              <Text
                style={{
                  marginTop: insets.top + 4,
                  fontSize: 18,
                  fontWeight: '600',
                  color: tintColor,
                }}
              >
                Participants
              </Text>
            ),
            animation: 'default',
            gestureEnabled: true,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="[tripId]/sendInvites"
          options={{
            title: 'Invite',
            headerTitle: () => (
              <Text
                style={{
                  marginTop: insets.top + 4,
                  fontSize: 18,
                  fontWeight: '600',
                  color: tintColor,
                }}
              >
                Invite
              </Text>
            ),
            animation: 'default',
            gestureEnabled: true,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Stack>

      <TripControllerModal
        triggerRef={modalRef}
        status={trip.status}
        isHost={isHost}
        isPinned={isPinned}
        onEdit={onEdit}
        onItinerary={onItinerary}
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

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = dayjs().tz(userTimezone).startOf('day');
  const allDays = trip ? getTripDays(trip.start_date, trip.end_date) : [];
  const tripDays =
    trip?.status === 'ongoing'
      ? allDays.filter((d) =>
          dayjs.tz(`${d}T00:00:00`, userTimezone).isSameOrAfter(today, 'day'),
        )
      : allDays;

  const { hasItinerary } = useItineraries(trip?.id, tripDays);
  const isDisabled = trip?.status === 'ongoing' && !hasItinerary;

  const pinTrip = usePinTrip(trip?.id ?? '', refreshTrip);

  if (loading || !trip) return null;

  return (
    <TripThemeProvider videoKey={trip.video_background ?? 'default'}>
      <TripLayoutInner
        tripId={Array.isArray(tripId) ? tripId[0] : tripId}
        isHost={isHost}
        isPinned={isPinned}
        isDisabled={isDisabled}
        trip={trip}
        pinTrip={pinTrip}
        modalRef={modalRef}
        inviteModalRef={inviteModalRef}
      />
    </TripThemeProvider>
  );
}
