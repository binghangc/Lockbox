import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TripHeader from '@/components/tripHeader';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';



export default function TripDetailScreen() {
    const { tripId } = useLocalSearchParams();
    const router = useRouter();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (res.ok) {
                    setTrip(data);
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (tripId) fetchTrip();
    }, [tripId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator color="white" />
            </View>
        );
    }

    if (!trip) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white">Trip not found</Text>
            </View>
        );
    }

    return (
        <>
            <TripHeader onBack={() => router.back()} />
            <ScrollView
                className="flex-1 bg-black"
                contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Trip Title */}
                <View className="px-3 mb-6">
                    <Text className="text-4xl font-extrabold text-center text-white">{trip.title}</Text>
                </View>
                {/* Trip Thumbnail */}
                <View className="w-full px-4 mb-3">
                    <View className="aspect-square w-full">
                        <Image
                            source={{ uri: trip.thumbnail_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                </View>
                {/* Trip Dates */}
                <View className="flex-row items-center justify-between p-3">
                    <Text className="text-white text-2xl font-semibold" numberOfLines={2} style={{ textAlign: 'left' }}>
                        {trip.start_date && trip.end_date
                            ? `${dayjs(trip.start_date).format('dddd, MMM D')} -\n${dayjs(trip.end_date).format('dddd, MMM D')}`
                            : 'Dates unavailable'}
                    </Text>
                </View>
                {/* Host row */}
                <View className="p-3">
                    <View className="flex-row items-center">
                        <FontAwesome6 name="crown" size={15} color="#a3a3a3" />
                        <Text className="text-neutral-400 text-xl ml-2">Hosted by</Text>
                    </View>
                    {trip.host && (
                        <TouchableOpacity className="flex-row items-center gap-3 mt-2 ml-4" onPress={() => { }}>
                            <Image source={{ uri: trip.host.avatar_url }} className="w-10 h-10 rounded-full" />
                            <Text className="text-white text-xl font-bold">{trip.host.name}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Country */}
                    {trip.country && (
                        <View className="flex-row items-center mt-4 ml-[2px]">
                            <FontAwesome6 name="location-dot" size={15} color="#a3a3a3" />
                            <Text className="text-neutral-400 text-xl ml-2">{trip.country}</Text>
                        </View>
                    )}
                    {/* Description */}
                    {trip.description && (
                        <Text className="text-neutral-400 text-lg mt-4">{trip.description}</Text>
                    )}

                </View>

            </ScrollView>
        </>
    );
}