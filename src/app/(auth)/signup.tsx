import React, { useState } from 'react';
import { Alert, Text, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import FormInput from '@/components/formInput';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);

        if (!email || !password || !username) {
            Alert.alert('Error', 'Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            const result = await response.json();

            if (!response.ok) {
                Alert.alert('Error', result.error || 'Something went wrong');
            } else {
                Alert.alert('Success', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-black justify-center px-6">
            <Text className="text-white text-2xl font-bold mb-8 text-center">Create an Account</Text>

            <FormInput
                label="Email"
                placeholder="email@address.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <FormInput
                label="Username"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
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
                onPress={signUpWithEmail}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-center font-bold">Sign Up</Text>
                )}
            </TouchableOpacity>

            <View className="mt-6 flex-row justify-center">
                <Text className="text-white">Already have an account? </Text>
                <Link href="./login" className="text-blue-400 font-bold">
                    Log in
                </Link>
            </View>
        </View>
    );
}