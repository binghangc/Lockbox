import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TripPillbar() {
    return (
        <View className="absolute bottom-5 w-[95%] self-center z-50">
            <BlurView
                intensity={40}
                tint="dark"
                className="rounded-full px-6 py-6 border border-white/10 flex-row justify-between items-center bg-white/5 overflow-hidden"
            >
                {[
                    { name: 'edit', label: 'Edit' },
                    { name: 'bell', label: 'Notify' },
                    { name: 'camera', label: 'Capture' },
                    { name: 'user-plus', label: 'Invite' },
                    { name: 'ellipsis-h', label: 'More' },
                ].map((item, idx) => (
                    <TouchableOpacity key={idx} className="items-center justify-center">
                        <FontAwesome5 name={item.name} size={16} color="#fff" />
                        <Text className="text-[11px] text-[#d4d4d4] mt-1">{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </BlurView>
        </View>
    );
}