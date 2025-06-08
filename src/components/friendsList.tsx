import { View, Text, Pressable, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { Profile } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FriendActionButton from "@/components/friendActionButton";

type FriendRow = Profile & { friendshipId: string };
type FriendsListProps = {
    onSelect: (user: Profile) => void | Promise<void>;
    mode?: "default" | "invite";
    alreadyInvitedIds?: string[];
};

export default function FriendsList({
    onSelect,
    mode = "default",
    alreadyInvitedIds = [],
}: FriendsListProps) {
    const router = useRouter();
    const [friends, setFriends] = useState<FriendRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteStatus, setInviteStatus] = useState<Record<string, "idle" | "loading" | "sent" | "failed">>({});
  
    const listFriends = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          const { error } = await res.json();
          console.error("Error fetching friends:", error);
          return;
        }
  
        const data = await res.json();
        setFriends(data);
      } catch (error) {
        console.error("Friends error:", "failed to retrieve friends");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      listFriends();
  
      setInviteStatus((prev) => {
        const updated = { ...prev };
        for (const id of alreadyInvitedIds) {
          updated[id] = "sent";
        }
        return updated;
      });
    }, []);
  
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
  
    const renderFriendRow = (item: FriendRow) => {
      const status = inviteStatus[item.id] ?? (alreadyInvitedIds?.includes(item.id) ? "sent" : undefined);
  
      return (
        <TouchableOpacity
          key={item.id}
          className="bg-zinc-900 rounded-2xl px-4 py-3 flex-row items-center mb-3"
          onPress={() => onSelect(item)}
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
          <FriendActionButton
            mode={mode}
            status={status}
            disabled={mode === "invite" && (status === "sent" || alreadyInvitedIds.includes(item.id))}
            onPress={() => {
              if (mode === "invite") {
                if (status === "sent") return;
  
                setInviteStatus((prev) => ({ ...prev, [item.id]: "loading" }));
                Promise.resolve(onSelect(item))
                  .then(() => {
                    setInviteStatus((prev) => ({ ...prev, [item.id]: "sent" }));
                    alert("Invite sent successfully!");
                  })
                  .catch(() => {
                    setInviteStatus((prev) => ({ ...prev, [item.id]: "failed" }));
                    alert("Failed to send invite.");
                  });
              } else {
                onSelect(item);
              }
            }}
          />
        </TouchableOpacity>
      );
    };
  
    const renderThreshold = 7; 
  
    if (friends.length <= renderThreshold) {
      return <View className="mt-4">{friends.map(renderFriendRow)}</View>;
    }
  
    return (
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        className="mt-4"
        renderItem={({ item }) => renderFriendRow(item)}
      />
    );
  }