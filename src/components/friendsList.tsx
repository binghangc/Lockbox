import { View, Text, Pressable, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import type { Profile } from "@/types";

type FriendRow = Profile & { friendshipId: string };

export default function FriendsList({
    friends,
    loading,
    onSelect,
}: {
    friends: FriendRow[];
    loading: boolean;
    onSelect: (user: Profile) => void;
}) {
    const router = useRouter();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-white mb-4">Fetching your travel buddies...</Text>
                <View className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </View>
        );
    }

    if (friends.length === 0) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-white text-center text-base mb-3">
                    You haven’t added anyone yet. Start connecting with fellow explorers!
                </Text>
                <Pressable
                    onPress={() => router.push("/friends/search")}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white text-center font-semibold">Find Friends</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            className="mt-4"
            renderItem={({ item }: { item: FriendRow }) => (
                <TouchableOpacity
                    className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
                    onPress={() => onSelect(item)}
                >
                    <View className="w-14 h-14 rounded-full items-center justify-center">
                        {/* Glow layer */}
                        <View className="absolute w-14 h-14 rounded-full bg-blue-400/30 opacity-60 blur-md" />
                        <View className="absolute w-12 h-12 rounded-full bg-blue-400/40 blur-sm" />
                        <Image
                            source={{ uri: item.avatar_url }}
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-white text-lg font-semibold">{item.name}</Text>
                        {item.username && (
                            <Text className="text-white/60 text-sm">@{item.username}</Text>
                        )}
                    </View>
                    <Pressable
                        onPress={() => onSelect(item)}
                        className="px-3 py-1 bg-blue-600 rounded-full"
                    >
                        <Text className="text-white text-sm">Nudge</Text>
                    </Pressable>
                </TouchableOpacity>
            )}
        />
    );
}
