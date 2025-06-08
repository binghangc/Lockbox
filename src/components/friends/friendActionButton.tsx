import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  mode: "default" | "invite";
  status?: "idle" | "loading" | "sent" | "failed";
  onPress: () => void;
  disabled?: boolean;
  onRemove?: () => void;
};

export default function FriendActionButton({
  mode,
  status,
  onPress,
  disabled,
  onRemove,
}: Props) {
  const [showOptions, setShowOptions] = useState(false);

  if (mode === "invite") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="px-3 py-1 bg-blue-600 rounded-full"
      >
        {status === "sent" ? (
          <Feather name="check" size={16} color="white" />
        ) : (
          <Feather name="send" size={16} color="white" />
        )}
      </Pressable>
    );
  }

  return (
    <View className="relative overflow-visible z-50">
      <Pressable
        onPress={() => setShowOptions(!showOptions)}
        className="px-2 py-1 rounded-full bg-zinc-800"
      >
        <Feather name="more-vertical" size={18} color="white" />
      </Pressable>

      {showOptions && (
        <View className="absolute right-10 top-1 bg-zinc-800 rounded-xl px-3 py-2 min-w-[150px] z-50">
          <Pressable className="flex-row items-center space-x-3">
            <Feather name="user-x" size={16} color="#ef4444" className="mr-1" />
            <Text className="text-red-500 font-semibold text-sm" numberOfLines={1}>
               Remove friendship
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}