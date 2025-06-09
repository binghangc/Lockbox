import { View, Text, Pressable } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";

export default function AddFriendRow({ 
    onAddFriend, 
    onMoreOptions, 
    status = "none", 
}: {
    onAddFriend: () => void;
    onMoreOptions: () => void;
    status?: "accepted" | "pending" | "none";
}) {
    return (
        <View className="flex-row items-center justify-center mt-4">
        {/* Add Friend Button */}
        <Pressable
            onPress={onAddFriend}
            disabled={status === "pending"}
            className={`flex-row items-center justify-center min-w-[200px] rounded-2xl px-6 py-3 ${
                status === "pending" ? "bg-purple-700" : "bg-white"
            }`}
        >
            <Feather name="user-plus" size={18} color={status === "pending" ? "white" : "black"} className="mr-2" />
            <Text
                className={`font-semibold text-base ${
                    status === "pending" ? "text-white" : "text-black"
                }`}
            >
                {status === "pending" ? "Request Sent" : "Add friend"}
            </Text>
        </Pressable>

        {/* More Options Button */}
        <Pressable
            onPress={onMoreOptions}
            className="w-11 h-11 rounded-2xl border border-white items-center justify-center ml-3"
        >
            <Entypo name="dots-three-horizontal" size={18} color="white" />
        </Pressable>
        </View>
    );
}