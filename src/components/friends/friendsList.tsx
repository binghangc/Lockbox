import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { Profile } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FriendRow from "@/components/friends/friendRow"

type FriendRow = Profile & { friendshipId: string };
type FriendsListProps = {
    onSelect: (user: Profile) => void | Promise<void>;
    mode?: "default" | "invite";
    alreadyInvitedIds?: string[];
    onCountUpdate?: (count: number) => void;
};

export default function FriendsList({
    onSelect,
    mode = "default",
    alreadyInvitedIds = [],
    onCountUpdate,
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
        onCountUpdate?.(data.length);
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

    useEffect(() => {
      if (!loading) {
        onCountUpdate?.(friends.length);
      }
    }, [friends.length, loading]);
  
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
        <View className="flex-1 w-full mt-auto mb-auto items-center">
          <Text className="text-gray-400 text-center text-base mb-3 mt-3">
            You haven’t added anyone yet. Start connecting with fellow explorers!
          </Text>
          <Pressable
            onPress={() => router.push("/friends/search")}
            className="bg-zinc-800 px-6 py-3 rounded-xl active:bg-white/10"
          >
            <Text className="text-white text-center font-semibold">Find Friends</Text>
          </Pressable>
        </View>
      );
    }
  
    const renderFriendRow = (item: FriendRow) => {
      const status = inviteStatus[item.id] ?? (alreadyInvitedIds?.includes(item.id) ? "sent" : undefined);
  
      return (
        <FriendRow
          key={item.id}
          item={item}
          mode={mode}
          alreadyInvitedIds={alreadyInvitedIds}
          inviteStatus={inviteStatus}
          onSelect={onSelect}
          setInviteStatus={setInviteStatus}
          refreshList={listFriends}
        />
      );
    };
  
    const renderThreshold = mode === "invite" ? 3 : 7;
  
    if (friends.length <= renderThreshold) {
      return <View className="mt-4">{friends.map(renderFriendRow)}</View>;
    }
  
    return (
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        className="mt-4"
        renderItem={({ item }) => (
          <View style={{ overflow: "visible" }}>
            {renderFriendRow(item)}
          </View>
        )}
      />
    );
}