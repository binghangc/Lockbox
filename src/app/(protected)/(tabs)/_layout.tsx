import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Tabs } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

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
        <Tabs.Screen name='index'
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Octicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name='plus'
          options={{
            title: 'Plus',
            tabBarIcon: ({ color, size }) => (
              <Octicons name="diff-added" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name='profile'
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Octicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}