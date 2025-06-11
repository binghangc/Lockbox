import {
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  ImageBackground,
} from 'react-native';
import { useEffect, useState } from 'react';
import type { Invite } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

type InvitesListProps = {
  onInviteSelected: (invite: Invite) => void;
};

export default function InvitesList({ onInviteSelected }: InvitesListProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const listInvites = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/invites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const { error } = await res.json();
        console.error('Error fetching invites:', error);
        return;
      }

      const data = await res.json();
      setInvites(data);
    } catch (error) {
      console.error('Invites error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listInvites();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white mb-4">
          What adventures are your friends up to...
        </Text>
        <View className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </View>
    );
  }

  if (invites.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white text-center text-base mb-3">
          No one&#39;s invited you anywhere. That&#39;s a sign to start your own
          trip!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invites}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onInviteSelected?.(item)}
          className="flex-row items-center px-4 py-3 border-b border-white/10"
        >
          <ImageBackground
            source={{ uri: item.trip.thumbnail_url }}
            className="w-full rounded-2xl overflow-hidden"
            resizeMode="cover"
            style={{ height: 160 }}
          >
            <BlurView
              intensity={20}
              tint="dark"
              className="flex-1 px-4 py-4 justify-between"
            >
              <View className="flex-row items-center mb-3">
                <Image
                  source={{ uri: item.trip.host.avatar_url }}
                  className="w-12 h-12 rounded-full mr-3 bg-gray-300"
                />
                <View>
                  <Text className="text-white font-semibold text-base">
                    {item.trip.host.username || 'Unknown Host'}
                  </Text>
                  <Text className="text-sm text-gray-400">{item.status}</Text>
                </View>
              </View>

              <View className="pl-[60px]">
                <Text className="text-white font-bold text-lg">
                  {item.trip.title}
                </Text>
                <Text className="text-gray-300 text-sm">
                  {item.trip.description}
                </Text>
              </View>
            </BlurView>
          </ImageBackground>
        </Pressable>
      )}
    />
  );
}
