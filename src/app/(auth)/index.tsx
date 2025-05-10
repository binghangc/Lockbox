import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useUser } from '@/components/UserContext';
import FloatingOrb from '@/components/floatingOrb';


export default function LoginScreen() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { setUser } = useUser();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/login' : '/signup';

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, ...(mode === 'signup' && { username }) }),
            });

            const result = await response.json();
            if (!response.ok) {
                Alert.alert('Error', result.error || 'Something went wrong');
                return;
            }

            const token = result.session?.access_token;
            if (!token) throw new Error('Missing access token from response');
            await AsyncStorage.setItem('access_token', token);

            const profileRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const profileData = await profileRes.json();

            if (!profileRes.ok || !profileData.profile) {
                throw new Error('Failed to fetch profile');
            }

            setUser(profileData.profile);
            router.replace('/(tabs)');
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 items-center justify-center px-6 bg-neutral-900"
        >

        {/* Orbs behind the card */} 
        <FloatingOrb style={{ top: 100, left: -60 }} color="bg-purple-500/20" shadowColor="#a855f7" />
        <FloatingOrb style={{ bottom: 80, right: -40 }} color="bg-purple-500/20" shadowColor="#a855f7" />
        <FloatingOrb style={{ bottom: 180, left: -50 }} color="bg-pink-400/30" shadowColor="#f472b6" />
        <FloatingOrb style={{ bottom: 80, right: -40 }} color="bg-blue-400/30" shadowColor="#60a5fa" />
        <FloatingOrb style={{ top: 200, right: 100 }} color="bg-emerald-400/30" shadowColor="#34d399" />


        <BlurView intensity={50} tint="dark" className="w-full rounded-2xl p-6 max-w-md">
            <Text className="text-white text-2xl font-semibold mb-6 text-center">
            {mode === 'login' ? 'Login' : 'Sign Up'}
            </Text>

            <View className="flex-row justify-center mb-6">
            <TouchableOpacity
                className={`px-4 py-2 rounded-l-full ${
                mode === 'login' ? 'bg-white/20' : 'bg-transparent'
                }`}
                onPress={() => setMode('login')}
            >
                <Text className="text-white">Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className={`px-4 py-2 rounded-r-full ${
                mode === 'signup' ? 'bg-white/20' : 'bg-transparent'
                }`}
                onPress={() => setMode('signup')}
            >
                <Text className="text-white">Sign Up</Text>
            </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Email address"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                className="bg-white/10 text-white px-4 py-3 rounded-md mb-4"
            />

            {mode === 'signup' && (
            <TextInput
                placeholder="Username"
                placeholderTextColor="#aaa"
                value={username}
                onChangeText={setUsername}
                className="bg-white/10 text-white px-4 py-3 rounded-md mb-4"
            />
            )}

            <TextInput
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                className="bg-white/10 text-white px-4 py-3 rounded-md mb-6"
            />

            <TouchableOpacity
                className={`bg-blue-600 py-3 rounded-md ${loading ? 'opacity-50' : ''}`}
                disabled={loading}
                onPress={handleSubmit}
                >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-center font-bold">
                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                    </Text>
                )}
            </TouchableOpacity>
        </BlurView>
        </KeyboardAvoidingView>
    );
}
