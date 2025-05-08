import { Text, View, Button, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';    

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        avatar_url: '',
        name: '',
        username: '',
        bio: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
        
            if (!session || error) {
                console.error('No session found:', error?.message);
                router.replace('/(auth)/login');
                return;
            }
        
            const token = session.access_token;
        
            try {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                });
        
                if (!res.ok) throw new Error('Profile fetch failed');
        
                const userData = await res.json();
                setProfile(userData);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchProfile();
      }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            console.log('User logged out successfully');
            router.replace('/(auth)/login');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black items-center justify-center px-6">
            {profile.avatar_url ? (
                <Image
                    source={{ uri: profile.avatar_url }}
                    className="w-32 h-32 rounded-full mb-4"
                />
            ) : (
                <View className="w-32 h-32 rounded-full bg-gray-700 mb-4" />
            )}
            <Text className="text-white text-xl font-bold mb-2">{profile.name || 'Name not set'}</Text>
            <Text className="text-gray-400 text-lg mb-2">@{profile.username || 'Username not set'}</Text>
            <Text className="text-gray-300 text-center mb-6">{profile.bio || 'Bio not set'}</Text>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
}
  