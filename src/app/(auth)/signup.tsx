import React, { useState } from 'react';
import { Alert, Text, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';

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
            const response = await fetch('http://172.31.11.46:3000/signup', {
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

            <View className="mb-4">
                <Text className="text-white mb-2">Username</Text>
                <TextInput
                    className="bg-neutral-800 text-white px-4 py-3 rounded-md"
                    placeholder="Username"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
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