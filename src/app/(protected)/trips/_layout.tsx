import React, { useRef } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import useTrips from '@/hooks/useTrips';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import InviteFriendsModal from '@/components/invites/inviteFriendsModal';
import usePinTrip from '@/hooks/usePinTrip';
import createCalendarEvent from '@/utils/calendarEvent';

import TripControllerModal from '@/components/tripControllerModal';

import { Modalize } from 'react-native-modalize';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParamListBase } from '@react-navigation/native';

import { ConfettiProvider } from '@/components/confetti';

type HeaderLeftProps = {
  navigation: NativeStackNavigationProp<ParamListBase>;
};

function HeaderLeft({ navigation }: HeaderLeftProps) {
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Octicons
        name="chevron-left"
        size={28}
        color="white"
        style={{ marginLeft: 12 }}
      />
    </TouchableOpacity>
  );
}

function HeaderLeftWrapper({
  navigation,
}: {
  navigation: NativeStackNavigationProp<ParamListBase>;
}) {
  return <HeaderLeft navigation={navigation} />;
}

function HeaderLeftWithNavigation({
  navigation,
}: {
  navigation: NativeStackNavigationProp<ParamListBase>;
}) {
  return <HeaderLeftWrapper navigation={navigation} />;
}

function HeaderBackground() {
  return (
    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
  );
}

function headerLeftWithNavigation({
  navigation,
}: {
  navigation: NativeStackNavigationProp<ParamListBase>;
}) {
  return <HeaderLeftWithNavigation navigation={navigation} />;
}

const headerBackground = () => <HeaderBackground />;

export default function TripsLayout() {
  const router = useRouter();
  const modalRef = useRef<Modalize | null>(null);
  const inviteModalRef = useRef<Modalize | null>(null);

  const { tripId } = useLocalSearchParams();
  const { trip, isHost, loading, isPinned, refreshTrip } = useTrips(
    Array.isArray(tripId) ? tripId[0] : tripId,
  );

  const pinTrip = usePinTrip(trip?.id ?? '', () => {
    refreshTrip();
  });

  if (loading || !trip) return null;

  const onEdit = () => {
    router.push(`/trips/${tripId}/edit`);
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
      console.log('success');
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

  return (
    <ConfettiProvider>
      <>
        <Stack
          screenOptions={({ navigation }) => ({
            headerShown: true,
            headerTransparent: true,
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerLeft: headerLeftWithNavigation.bind(null, { navigation }),
            headerBackground,
            title: '',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => modalRef.current?.open()}
                style={{ marginRight: 12 }}
              >
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={28}
                  color="white"
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
          <Stack.Screen
            name="[tripId]/edit"
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
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
        <InviteFriendsModal
          ref={inviteModalRef}
          tripId={Array.isArray(tripId) ? tripId[0] : tripId}
        />
      </>
    </ConfettiProvider>
  );
}
