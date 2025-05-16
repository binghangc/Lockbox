import { useRouter, Stack } from "expo-router";
import { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Modal, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import FormInput from "@/components/formInput";

type UserProfile = {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
};

export default function FriendsSearchScreen() {
    const router = useRouter;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

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
        />
  
        {loading && <ActivityIndicator color="white" className="mt-4" />}
  
        <FlatList
          data={results}
          keyExtractor={(item: UserProfile) => item.id}
          className="mt-4"
          renderItem={({ item }: { item: UserProfile }) => (
            <TouchableOpacity className="py-3 border-b border-white/10">
                <Text className="text-white text-lg">{item.username}</Text>
                {item.full_name && (
                    <Text className="text-white/60">{item.full_name}</Text>
                )}
            </TouchableOpacity>
          )}
        />

        <Modal
            visible={selectedUser !== null}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedUser(null)}
        >
            <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                <Text className="text-xl font-bold mb-2">{selectedUser?.username}</Text>
                {selectedUser?.full_name && (
                <Text className="text-gray-600 mb-4">{selectedUser.full_name}</Text>
                )}
                {/* Add more profile info here */}
                <Pressable onPress={() => setSelectedUser(null)} className="mt-4 bg-black rounded-xl p-3">
                <Text className="text-white text-center">Close</Text>
                </Pressable>
            </View>
            </View>
        </Modal>
        </View>
    );
}