import { Alert, Text, View, Button, ActivityIndicator, Image, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';  

import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Feather } from '@expo/vector-icons';

// Components
import { useUser } from '@/components/UserContext'; 
import FormInput from '@/components/formInput';
import EditActionRow from '@/components/editActionRow';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, setUser, loading } = useUser();

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempName, setTempName] = useState(user?.name || '');
    const [tempBio, setTempBio] = useState(user?.bio || '');

    useEffect(() => {
        if (user) {
            setTempName(user.name || '');
            setTempBio(user.bio || '');
        }
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
            return;
        } else {
            console.log('User logged out successfully');
            await AsyncStorage.removeItem('access_token');
            setUser(null);
            router.replace('/(auth)/login');
        }
    };

    const handleUpdateProfile = async (field: 'name' | 'bio', value: string) => {
        if (tempName === user?.name && tempBio === user?.bio) {
            setIsEditingName(false);
            setIsEditingBio(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    field,
                    value,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                Alert.alert('Error', result.error || 'Failed to update profile');
                return;
            }
            setUser({ ...user, [field]: value });
        } catch (err) {
            Alert.alert('Error', 'Something went wrong');
            console.error(err);
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
            {user.avatar_url ? (
                <Image
                    source={{ uri: user.avatar_url }}
                    className="w-32 h-32 rounded-full mb-4"
                />
            ) : (
                <View className="w-32 h-32 rounded-full bg-gray-700 mb-4" />
            )}
            <Text className="text-gray-400 text-lg mb-2">@{user.username || 'Username not set'}</Text>

            {/* Name */}
            <View className="w-full mb-3">
                {isEditingName ? (
                <View>
                    <FormInput
                        label="Name"
                        value={tempName}
                        onChangeText={setTempName}
                        onEndEditing={() => {
                            if (tempName !== user?.name) {
                                handleUpdateProfile('name', tempName);
                            }
                            setIsEditingName(false);
                        }}  
                        placeholder="Enter name"
                    />
                    <EditActionRow
                        onCancel={() => setIsEditingName(false)}
                        onSave={async () => {
                            await handleUpdateProfile('name', tempName);
                            setIsEditingName(false);
                        }}
                    />
                </View>
                ) : (
                <View className="w-full mb-4">
                    <View className="flex-row items-center justify-center space-x-2">
                        <Text className="text-white text-xl">{user.name || 'Name not set'}</Text>
                        <TouchableOpacity onPress={() => setIsEditingName(true)}>
                            <Feather name="edit-2" size={18} color="#aaa" />
                        </TouchableOpacity>
                    </View>
                </View>
                )}
                
            </View>
            
            {/* Bio */}
            <View className="w-full mb-6">
                {isEditingBio ? (
                    <View>
                        <FormInput
                            label="Bio"
                            value={tempBio}
                            onChangeText={setTempBio}
                            onEndEditing={() => {
                                if (tempBio !== user?.bio) {
                                handleUpdateProfile('bio', tempBio);
                                }
                                setIsEditingBio(false);
                            }}
                            placeholder="Enter bio"
                            multiline
                        />
                        <EditActionRow
                            onCancel={() => setIsEditingBio(false)}
                            onSave={async () => {
                                await handleUpdateProfile('bio', tempBio);
                                setIsEditingBio(false);
                            }}
                        />
                    </View>
                ) : (
                    <View className="w-full mb-4">
                        <View className="flex-row items-center justify-center space-x-10">
                            <Text className="text-white text-l">{user.bio || 'Bio not set'}</Text>
                            <TouchableOpacity onPress={() => setIsEditingBio(true)}>
                                <Feather name="edit-2" size={18} color="#aaa" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
}
  