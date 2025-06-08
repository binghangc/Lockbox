import { View, Text, Pressable } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";

export default function AddFriendRow({ onAddFriend, onMoreOptions }: {
    onAddFriend: () => void;
    onMoreOptions: () => void;
}) {
    return (
        <View className="flex-row items-center justify-center mt-4">
        {/* Add Friend Button */}
        <Pressable
            onPress={onAddFriend}
            className="flex-row items-center justify-center bg-white min-w-[200px] rounded-2xl px-6 py-3"
        >
            <Feather name="user-plus" size={18} color="black" className="mr-2" />
            <Text className="text-black font-semibold text-base">Add friend</Text>
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