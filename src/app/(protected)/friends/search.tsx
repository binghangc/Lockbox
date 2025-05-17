import { useRouter, Stack } from "expo-router";
import { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import FormInput from "@/components/formInput";
import { Profile } from "@/types"
import UserProfileModal from "@/components/userProfileModal";
import { useUser } from "@/components/UserContext";

export default function FriendsSearchScreen() {
    const { user } = useUser();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    const handleSearchUsers = async (username: string) => {
        if (!username || username.length < 2) return setResults([]);
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
            setResults(data);
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

    return (
        <View className="flex-1 bg-black px-4 pt-12">
            <FormInput
                label="Search"
                placeholder="Search by username"
                value={query}
                onChangeText={handleChange}
                placeholderTextColor="#888"
                autoCorrect={false}
                autoCapitalize="none"
                spellCheck={false}
            />
    
            {loading && <ActivityIndicator color="white" className="mt-4" />}
    
            <FlatList
                data={results}
                keyExtractor={(item: Profile) => item.id}
                className="mt-4"
                renderItem={({ item }: { item: Profile }) => (
                    <TouchableOpacity
                        className="py-3 border-b border-white/10"
                        onPress={() => setSelectedUser(item)}
                    >
                        <Text className="text-white text-lg">{item.username}</Text>
                        {item.name && (
                            <Text className="text-white/60">{item.name}</Text>
                        )}
                    </TouchableOpacity>

                )}
            />

            <UserProfileModal
                isVisible={selectedUser !== null}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                currentUserId={user?.id}
                isFriends={false}
            />
        </View>
    );
}