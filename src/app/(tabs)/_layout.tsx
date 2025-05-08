import { Tabs } from 'expo-router';
import { Octicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'white', tabBarShowLabel: false }}>
            <Tabs.Screen name='index'
                         options={{
                             title: 'Home',
                             tabBarIcon: ({ color, size }) => (
                                <Octicons name="home" size={size} color={color} />
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
    );
}