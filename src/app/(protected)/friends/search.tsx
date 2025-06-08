import { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import FormInput from "@/components/formInput";
import { Profile } from "@/types"
import UserProfileModal from "@/components/userProfileModal";
import { useUser } from "@/components/UserContext";
import { Feather } from "@expo/vector-icons";

type SearchResult = Profile & { status: "accepted" | "pending" | "none" };

export default function FriendsSearchScreen() {
    const { user } = useUser();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);

    const handleSearchUsers = async (username: string) => {
        if (!username || username.length < 2) return setResults([]);;
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/search?username=${username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!res.ok) {
                const { error } = await res.json();
                console.error("Error fetching users:", error);
                return;
            }

            const data = await res.json();
            setResults(data ?? []);
        } catch(error) {
            console.error("Error", "cannot retrieve users")
        }
        setLoading(false);
    }

    const debouncedSearch = debounce(handleSearchUsers, 300);

    const handleChange = (text: string) => {
        setQuery(text);
        debouncedSearch(text);
    };

    const accepted = results.filter(r => r.status === "accepted");
    const notaccepted = results.filter(r => r.status != "accepted");

    return (
        <View className="flex-1 bg-black px-4 pt-12">
            <FormInput
                label="Add Friends"
                placeholder="Search by username"
                value={query}
                onChangeText={handleChange}
                placeholderTextColor="#888"
                autoCorrect={false}
                autoCapitalize="none"
                spellCheck={false}
                icon={<Feather name="search" size={20} color="#888" />}
            />
    
            {loading && <ActivityIndicator color="white" className="mt-4" />}
    
            <View className="mt-4">
                {accepted.length > 0 && (
                    <>
                    <Text className="text-white text-sm font-semibold mb-2">MY FRIENDS</Text>
                    {accepted.map((item) => (
                        <TouchableOpacity
                        key={item.id}
                        className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
                        onPress={() => setSelectedUser(item)}
                        >
                        <View className="w-14 h-14 rounded-full items-center justify-center">
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
                        </TouchableOpacity>
                    ))}
                    </>
                )}

                {notaccepted.length > 0 && (
                    <>
                    <Text className="text-white text-sm font-semibold mt-4 mb-2">USERS</Text>
                    {notaccepted.map((item) => (
                        <TouchableOpacity
                        key={item.id}
                        className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
                        onPress={() => setSelectedUser(item)}
                        >
                        <View className="w-14 h-14 rounded-full items-center justify-center">
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
                        </TouchableOpacity>
                    ))}
                    </>
                )}
            </View>

            <UserProfileModal
                isVisible={selectedUser !== null}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                currentUserId={user?.id}
                isFriends={selectedUser?.status === "accepted"}
                status={selectedUser?.status}
            />
        </View>
    );
}