import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useUser } from '@/components/UserContext';
import FloatingOrb from '@/components/floatingOrb';

const ENABLE_FORGOT_PASSWORD = false;

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setUser, setToken } = useUser();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/signup';

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            ...(mode === 'signup' && { username }),
          }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Error', result.error || 'Something went wrong');
        return;
      }

      const token = result.session?.access_token;
      if (!token) throw new Error('Missing access token from response');
      await AsyncStorage.setItem('access_token', token);
      setToken(token);

      const profileRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        const errMsg = profileData?.error || 'Failed to fetch profile';
        throw new Error(errMsg);
      }
      if (!profileData.profile) {
        throw new Error('No profile data returned');
      }

      setUser(profileData.profile);
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', 'Unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 items-center justify-center px-6 bg-neutral-900"
    >
      {/* Orbs behind the card */}
      {Array.from({ length: 5 }).map((_, _idx) => (
        <FloatingOrb
          key={`floating-orb-${Math.random().toString(36).substr(2, 9)}`}
        />
      ))}

      <BlurView
        intensity={50}
        tint="dark"
        className="w-full rounded-2xl p-6 max-w-md"
      >
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
          autoCapitalize="none"
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

        {/* Forgot Password */}
        {/** TO DO: reset link not working */}
        {mode === 'login' && ENABLE_FORGOT_PASSWORD && (
          <TouchableOpacity
            onPress={async () => {
              if (!email) {
                Alert.alert('Oops', 'Enter your email first!');
                return undefined;
              }

              try {
                const res = await fetch(
                  `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  },
                );

                const data = await res.json();
                if (!res.ok)
                  throw new Error(data.error || 'Failed to send reset email');

                Alert.alert(
                  'Check your email',
                  'We just sent a password reset link ✉️',
                );
              } catch {
                Alert.alert('Error', 'Failed to send reset email');
              }
              return undefined;
            }}
            className="mb-6"
          >
            <Text className="text-blue-400 text-sm text-right">
              Forgot your password?
            </Text>
          </TouchableOpacity>
        )}

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
