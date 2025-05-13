import { Text, View, Button, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Components
import { useUser } from '@/components/UserContext'; 

export default function ProfileScreen() {
    const router = useRouter();
    const { user, setUser, loading } = useUser();

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
    
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (!res.ok) {
                const { error } = await res.json();
                console.error('Logout failed:', error);
                return;
            }
    
            Alert.alert('Success', 'Logged out successfully');
            console.log('User logged out through backend');
            await AsyncStorage.removeItem('access_token');
            setUser(null);
            router.replace('/(auth)/');
        } catch (err) {
            console.error('Logout error:', 'failed to connect to the server');
        }
    };


    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator color="#fff" />
            </View>
        );
    }
    
    if (!user) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg">Please log in again.</Text>
                <Button
                    title="Go to Login"
                    onPress={handleLogout}
                />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black items-center justify-center px-6">
            {/* Avatar */}
            {user.avatar_url ? (
                <View className="relative mb-4">
                <Image
                    source={{ uri: user.avatar_url }}
                    className="w-32 h-32 rounded-full border border-gray-300"
                />
                </View>
            ) : (
                <View className="w-32 h-32 rounded-full bg-gray-700 mb-4" />
            )}
            <Text className="text-gray-400 text-lg mb-2">@{user.username || 'Username not set'}</Text>

            {/* Name */}
            <View className="w-full mb-4">
                <View className="flex-row items-center justify-center space-x-2">
                    <Text className="text-white text-2xl">{user.name || 'Name not set'}</Text>
                </View>
            </View>                
            
            {/* Bio */}
            <View className="w-full mb-4">
                <View className="flex-row items-center justify-center space-x-2">
                    <Text className="text-white text-l">{user.bio || 'Bio not set'}</Text>
                </View>
            </View>

            {/* Stats */}
            <View className="flex-row space-x-10 mt-6 justify-between w-full px-8">
                {[
                { label: 'Trip Moments', count: 27 },
                { label: 'Vibe Checks', count: 12 },
                { label: 'Orbs', count: 5 },
                { label: 'Vaults', count: 9 },
                ].map((stat, index) => (
                <View key={index} className="items-center">
                    <Text className="text-white text-xl font-bold">{stat.count}</Text>
                    <Text className="text-neutral-400 text-xs">{stat.label}</Text>
                </View>
                ))}
            </View>

            {/* Buttons */}
            <View className="flex-row justify-center space-x-4 mt-6 w-full px-6">
                <TouchableOpacity
                className="w-[48%] rounded-lg overflow-hidden"
                onPress={() => router.push('/profile/edit')}
                >
                <LinearGradient
                    colors={['#4f46e5', '#60a5fa']}
                    className="py-4 rounded-full w-full items-center"
                >
                    <Text className="text-white font-semibold text-xl text-center">
                    Edit Profile
                    </Text>
                </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity className="w-[48%] rounded-lg overflow-hidden" onPress={handleLogout}>
                <LinearGradient
                    colors={['#f472b6', '#f87171']}
                    className="py-4 rounded-full w-full items-center"
                >
                    <Text className="text-white font-semibold text-xl text-center">
                    Log Out
                    </Text>
                </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}