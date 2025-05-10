import React, { useState } from 'react';
import { Alert, Text, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/components/UserContext'; 
import FormInput from '@/components/formInput';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useUser();

    async function signInWithEmail() {
        setLoading(true);

        try {
            // change it to local mac device
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const profileData = await profileRes.json();
              
            if (!profileRes.ok || !profileData.profile) {
                throw new Error('Failed to fetch profile after login');
            }
              
            setUser(profileData.profile);

            console.log('User signed in successfully');
            router.replace('/(tabs)'); // Navigate to the trip dashboard
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-black justify-center px-6">
            <Text className="text-white text-2xl font-bold mb-8 text-center">Welcome Back</Text>

            <FormInput
                label="Email"
                placeholder="email@address.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <FormInput
                label="Password"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />


            <TouchableOpacity
                className={`bg-blue-600 py-3 rounded-md ${loading ? 'opacity-50' : ''}`}
                disabled={loading}
                onPress={signInWithEmail}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-center font-bold">Sign In</Text>
                )}
            </TouchableOpacity>

            <View className="mt-6 flex-row justify-center">
                <Text className="text-white">Don’t have an account? </Text>
                <Link href="./signup" className="text-blue-400 font-bold">
                    Sign up
                </Link>
            </View>
        </View>
    );
}