import React, { useRef } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import useTrips from '@/hooks/useTrips';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

import TripControllerModal from '@/components/tripControllerModal';

import { Modalize } from 'react-native-modalize';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParamListBase } from '@react-navigation/native';

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
  const modalRef = useRef<Modalize | null>(null);
  const { tripId } = useLocalSearchParams();
  const { isHost } = useTrips(Array.isArray(tripId) ? tripId[0] : tripId);
  const onEdit = () => {};
  const onSync = () => {};
  const onPin = () => {};
  const onInvite = () => {};
  const onDelete = () => {};
  const onLeave = () => {};

  return (
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
      />
      <TripControllerModal
        triggerRef={modalRef}
        isHost={isHost}
        onEdit={onEdit}
        onSync={onSync}
        onPin={onPin}
        onInvite={onInvite}
        onDelete={onDelete}
        onLeave={onLeave}
      />
    </>
  );
}
