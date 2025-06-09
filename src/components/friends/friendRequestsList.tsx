import { useRouter, Stack } from "expo-router";
import { useEffect, useState, useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Animated, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FriendRequest } from "@/types";

export default function FriendRequestsList({
    requests,
    onSelect,
}: {
    requests: FriendRequest[];
    onSelect: (request: FriendRequest) => void;
}) {
    if (requests.length === 0) {
        return (
            <View className="flex-1 justify-center items-center">
            <Text className="text-white text-base">No friend requests yet.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => onSelect(item)} // sender is the profile of uid1
                    className="bg-zinc-800 p-4 rounded-xl mb-3"
                >
                    <View className="w-14 h-14 rounded-full items-center justify-center">
                        {/* Glow layer */}
                        <View className="absolute w-14 h-14 rounded-full bg-blue-400/30 opacity-60 blur-md" />
                        <View className="absolute w-12 h-12 rounded-full bg-blue-400/40 blur-sm" />
                        <Image
                            source={{ uri: item.sender.avatar_url }}
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-white text-lg font-semibold">{item.sender.name}</Text>
                        {item.sender.username && (
                            <Text className="text-white/60 text-sm">@{item.sender.username}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            )}
        />
    )
}