import React, { useState } from 'react';
import { Alert, Text, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);

        try {
            // change it to local mac device
            const response = await fetch(`${process.env.EXPO_PUBLIC_EMILIA_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                Alert.alert('Error', result.error || 'Something went wrong');
            } else {
                console.log('User signed in successfully');
                router.replace('/(tabs)'); // Navigate to the trip dashboard
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-black justify-center px-6">
            <Text className="text-white text-2xl font-bold mb-8 text-center">Welcome Back</Text>

            <View className="mb-4">
                <Text className="text-white mb-2">Email</Text>
                <TextInput
                    className="bg-neutral-800 text-white px-4 py-3 rounded-md"
                    placeholder="email@address.com"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            <View className="mb-6">
                <Text className="text-white mb-2">Password</Text>
                <TextInput
                    className="bg-neutral-800 text-white px-4 py-3 rounded-md"
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

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