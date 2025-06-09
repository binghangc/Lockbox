import { router, Tabs } from 'expo-router';
import { Octicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <LinearGradient
        colors={['rgba(17,17,17,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,1)']}
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 170,
          zIndex: 10,
        }}
        pointerEvents="none"
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'white',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            position: 'absolute',
            zIndex: 20,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: true,
            headerTransparent: true,
            title: '',
            headerRight: () => (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/invites')}
                  style={{ marginRight: 16 }}
                >
                  <FontAwesome5 name="ticket-alt" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/friends')}
                  style={{ marginRight: 16 }}
                >
                  <Octicons name="people" size={24} color="white" />
                </TouchableOpacity>
              </>
            ),
            tabBarIcon: ({ color, size }) => (
              <Octicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="plus"
          options={{
            title: 'Plus',
            tabBarIcon: ({ color, size }) => (
              <Octicons name="diff-added" size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push('/newTrip');
            },
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: true,
            headerTransparent: true,
            headerTitle: '',
            tabBarIcon: ({ color, size }) => (
              <Octicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
