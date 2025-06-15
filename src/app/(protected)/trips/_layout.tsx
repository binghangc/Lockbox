import { Stack } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

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
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTransparent: true,
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerLeft: headerLeftWithNavigation.bind(null, { navigation }),
        headerBackground,
        title: '',
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
  );
}
