import React from 'react';
import { Text, TouchableOpacity, Image, View, ScrollView, Alert } from 'react-native';
import InviteRow from './inviteRow';
import { Invite } from '@/types';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome6 } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InviteCard({ 
    invite,
    onClose,
}: {
    invite: Invite;
    onClose: () => void;
}) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const handleResponse = async (response: string) => {
        console.log("User chose:", response);
            
        const token = await AsyncStorage.getItem('access_token');

        if (!token) {
            return Alert.alert("Error", "You're not logged in.");
        }

        const endpointMap: Record<string, string> = {
            going: '/accept-invite',
            not_going: '/decline-invite',
        };
        
        const endpoint = endpointMap[response];
        
        if (!endpoint) {
            return Alert.alert("Unknown response", "That response type isn't supported.");
        }
        
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/invites${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: invite.id,
                    user_id: invite.user_id,
                    trip_id: invite.trip_id,
                }),
            });
        
            const data = await res.json();
        
            if (!res.ok) {
                console.error("Error:", data.error);
                return Alert.alert("Failed", data.error || "Something went wrong.");
            }
        
                Alert.alert("Success", `You responded: ${response.replace('_', ' ')}`);
                onClose();
          } catch (err) {
                console.error("API error:", err);
                Alert.alert("Error", "Something went wrong while sending your response.");
          }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View style={{ paddingTop: insets.top }} className="flex-1 px-4">
                <View className="flex-row items-center justify-between pt-6 pb-4">
                <TouchableOpacity onPress={onClose}>
                    <Feather name="x" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-bold">You're Invited!</Text>
                <View className="w-7" />
                </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-4">
                <Image
                source={{ uri: invite.trip.thumbnail_url }}
                className="w-full aspect-square mb-1"
                resizeMode="cover"
                />

                <Text className="text-white text-3xl font-bold mb-2">{invite.trip.title}</Text>
                <View className="flex-row items-center">
                    <FontAwesome6 name="crown" size={15} color="#a3a3a3" />
                    <Text className="text-neutral-400 text-xl ml-2">Hosted by</Text>
                </View>
                {invite.trip.host && (
                    <TouchableOpacity className="flex-row items-center gap-3 mt-2 ml-4" onPress={() => { }}>
                        <Image source={{ uri: invite.trip.host.avatar_url }} className="w-10 h-10 rounded-full" />
                        <Text className="text-white text-xl font-bold">{invite.trip.host.username}</Text>
                    </TouchableOpacity>
                )}
                {invite.trip.country && (
                    <View className="flex-row items-center mt-4 ml-[2px]">
                        <FontAwesome6 name="location-dot" size={15} color="#a3a3a3" />
                        <Text className="text-neutral-400 text-xl ml-2">{invite.trip.country}</Text>
                    </View>
                )}
                {/* Description */}
                {invite.trip.description && (
                    <Text className="text-neutral-400 text-lg mt-4">{invite.trip.description}</Text>
                )}
            </ScrollView>

            <View className="absolute bottom-6 left-0 right-0 items-center">
                <InviteRow onSelect={handleResponse} />
            </View>
            </View>
        </SafeAreaView>
    );
}