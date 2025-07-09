import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';

import { BlurView } from 'expo-blur';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modalize } from 'react-native-modalize';

import { ConfettiProvider } from '@/components/confetti';
import InviteFriendsModal from '@/components/invites/inviteFriendsModal';
import TripControllerModal from '@/components/tripControllerModal';

import useTrips from '@/hooks/useTrips';
import usePinTrip from '@/hooks/usePinTrip';
import createCalendarEvent from '@/utils/calendarEvent';
import { useTripTheme } from '@/context/TripThemeProvider';

function HeaderBackground({
  theme,
}: {
  theme: ReturnType<typeof useTripTheme>;
}) {
  return (
    <BlurView
      intensity={60}
      tint={theme.blurTint as 'light' | 'dark' | 'default'}
      style={StyleSheet.absoluteFill}
    />
  );
}

// headerBackground now uses theme from component scope

export default function TripsLayout() {
  const router = useRouter();
  const modalRef = useRef<Modalize | null>(null);
  const inviteModalRef = useRef<Modalize | null>(null);
  const theme = useTripTheme();
  const { tripId } = useLocalSearchParams();
  const { trip, isHost, loading, isPinned, refreshTrip } = useTrips(
    Array.isArray(tripId) ? tripId[0] : tripId,
  );

  const pinTrip = usePinTrip(trip?.id ?? '', refreshTrip);

  if (loading || !trip) return null;

  // --- Handlers ---
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

  const headerBackground = () => <HeaderBackground theme={theme} />;

  return (
    <ConfettiProvider>
      <>
        {/* Stack Navigation */}
        <Stack
          screenOptions={({ navigation }) => ({
            headerShown: true,
            headerTransparent: true,
            headerTintColor: theme.text,
            headerTitleAlign: 'center',
            title: '',
            headerBackground,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 12 }}
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
                style={{ marginRight: 12 }}
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
          <Stack.Screen
            name="[tripId]/edit"
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>

        {/* Modals */}
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
