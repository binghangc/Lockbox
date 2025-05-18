

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TripPillbar() {
    return (
        <View className="absolute bottom-5 left-4 right-4 z-50">
            <BlurView intensity={40} tint="dark" className="rounded-full px-5 py-3 border border-white/10 flex-row justify-between items-center">
                <TouchableOpacity>
                    <FontAwesome5 name="edit" size={16} color="white" />
                    <Text className="text-white text-xs mt-1">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <FontAwesome5 name="bell" size={16} color="white" />
                    <Text className="text-white text-xs mt-1">Notify</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <FontAwesome5 name="camera" size={16} color="white" />
                    <Text className="text-white text-xs mt-1">Capture</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <FontAwesome5 name="user-plus" size={16} color="white" />
                    <Text className="text-white text-xs mt-1">Invite</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <FontAwesome5 name="ellipsis-h" size={16} color="white" />
                    <Text className="text-white text-xs mt-1">More</Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}