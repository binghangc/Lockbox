import { View, Pressable, TouchableOpacity} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons, Feather } from '@expo/vector-icons';
import FriendRequestsSection from "@/components/friends/friendRequestsSection";
import FriendsSection from "@/components/friends/friendsSection";

export default function FriendsScreen() {
    const router = useRouter();

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="pl-3">
                            <Feather name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                    title: "Friends",
                    headerRight: () => (
                        <View className="flex-row gap-4 mr-4">
                            <Pressable onPress={() => router.push("/friends/search")}>
                                <Ionicons name="add-outline" size={26} color="white" />
                            </Pressable>
                        </View>
                    ),
                }}
            />
            <View className="flex-1 bg-black px-4 pt-6">
                <FriendRequestsSection />
                <FriendsSection />
            </View>
        </>
    );
}