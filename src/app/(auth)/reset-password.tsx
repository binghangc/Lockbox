import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
    const { access_token } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const router = useRouter();

    const handleReset = async () => {
        if (!access_token || !newPassword) return;

        try {
            const response = await fetch(`http://${ process.env.EXPO_PUBLIC_API_URL }:3000/reset-password`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                access_token,
                new_password: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Reset failed');
            
            Alert.alert('Success', 'Password updated. Please log in.');
            router.replace('/(auth)/'); // back to login
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    return (
        <View className="p-4">
        <Text className="text-white mb-2">Set a new password</Text>
        <TextInput
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            className="border p-2 bg-white mb-4"
        />
        <Button title="Reset Password" onPress={handleReset} />
        </View>
    );
}