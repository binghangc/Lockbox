import { Stack } from 'expo-router';

export default function ProtectedLayout() {
    return <Stack screenOptions={{ headerShown: false }}>
               <Stack.Screen
                name="plus" 
                options={{ animation: 'slide_from_bottom' }}
                />
           </Stack>
}