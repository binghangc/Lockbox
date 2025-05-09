import { Text, View, Button, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';  
import { useUser } from '@/components/UserContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function ProfileScreen() {
    const router = useRouter();
    const { user, setUser, loading } = useUser();

    useEffect(() => {
        console.log('Loading:', loading);
        console.log('User:', user);
        if (!loading && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, loading]);
    
    if (loading || !user) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator color="#fff" />
            </View>
        );
    }

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
            return;
        } else {
            console.log('User logged out successfully');
            await AsyncStorage.removeItem('access_token');
            console.log('Before setUser(null)');
            setUser(null);
            console.log('After setUser(null)');
        }
    };

    return (
        <View className="flex-1 bg-black items-center justify-center px-6">
            {user.avatar_url ? (
                <Image
                    source={{ uri: user.avatar_url }}
                    className="w-32 h-32 rounded-full mb-4"
                />
            ) : (
                <View className="w-32 h-32 rounded-full bg-gray-700 mb-4" />
            )}
            <Text className="text-white text-xl font-bold mb-2">{user.name || 'Name not set'}</Text>
            <Text className="text-gray-400 text-lg mb-2">@{user.username || 'Username not set'}</Text>
            <Text className="text-gray-300 text-center mb-6">{user.bio || 'Bio not set'}</Text>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
}
  