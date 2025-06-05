import React from 'react';
import { Text, TouchableOpacity, Image } from 'react-native';
import HostRow from './hostRow';
import { Trip } from '@/types';
import { useRouter } from 'expo-router';

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="w-72"
      onPress={() => router.push(`/trips/${trip.id}`)}
    >
      <Image
        source={{ uri: trip.thumbnail_url }}
        className="w-full aspect-square mb-1"
        resizeMode="cover"
      />
      <Text className="text-white font-bold text-xl mt-2" numberOfLines={1}>
        {trip.title}
      </Text>
      <HostRow host={trip.host} className="mt-0" />
    </TouchableOpacity>
  );
}