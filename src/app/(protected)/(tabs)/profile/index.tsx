import {
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingAvatar from '@/components/floatingAvatar';

// Components
import { useUser } from '@/components/UserContext';

export default function ProfileScreen() {
  const { user, setUser, loading } = useUser();
  const { logout } = useUser();
  const router = useRouter();
  const [tripCount, setTripCount] = useState<number | null>(null);
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/profile/stats/${user.id}`,
        );
        if (!res.ok) {
          const text = await res.text();
          console.error('Non-OK response:', text);
          return;
        }
        const data = await res.json();
        setTripCount(data.trip_count ?? 0);
        setFriendCount(data.friend_count ?? 0);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white text-lg">Please log in again.</Text>
        <Button title="Go to Login" onPress={logout} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ paddingTop: insets.top, backgroundColor: 'rgb(17, 17, 17)' }}
      contentContainerStyle={{ paddingVertical: 70 }}
    >
      <View className="items-center px-6">
        {/* Avatar */}
        {user.avatar_url ? (
          <FloatingAvatar uri={user.avatar_url} />
        ) : (
          <View className="w-32 h-32 rounded-full bg-gray-700 mb-4" />
        )}
        <Text className="text-gray-400 text-lg mb-2 font-semibold">
          @{user.username || 'Username not set'}
        </Text>

        {/* Name */}
        <View className="w-full mb-4">
          <View className="flex-row items-center justify-center space-x-2">
            <Text className="text-white text-2xl font-bold">
              {user.name || 'Name not set'}
            </Text>
          </View>
        </View>

        {/* Bio */}
        {user.bio && (
          <View className="w-full mb-4">
            <View className="flex-row items-center justify-center space-x-2">
              <Text className="text-white text-l">{user.bio}</Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View className="flex-row space-x-10 mt-2 justify-evenly w-full px-8">
          {[
            { label: 'Trips', count: tripCount ?? '-' },
            { label: 'Friends', count: friendCount ?? '-' },
          ].map((stat, index) => (
            <View key={index} className="items-center">
              <Text className="text-white text-xl font-bold">{stat.count}</Text>
              <Text className="text-neutral-400 text-sm font-semibold">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View className="mt-6 w-full px-6">
          {/* Edit Profile */}
          <TouchableOpacity
            onPress={() => router.push('/profileEdit')}
            className="rounded-md border border-white/30 bg-white/10 py-3 px-6 items-center w-full"
            activeOpacity={0.8}
          >
            <Text className="text-white font-medium text-base">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
