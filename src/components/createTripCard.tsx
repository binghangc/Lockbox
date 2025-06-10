import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import tripThumbnails from '@/constants/tripCycle';

export default function CreateTripCard() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % tripThumbnails.length);
    }, 200);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const thumbnail = tripThumbnails[index];

  return (
    <Pressable
      onPress={() => router.push('/(protected)/newTrip')}
      className="w-72 items-center"
    >
      <View className="w-72 aspect-square border-2 border-dashed border-neutral-500 justify-center items-center bg-black">
        <Image source={thumbnail} className="w-36 h-36" resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            bottom: 16,
            backgroundColor: 'white',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>+ New trip</Text>
        </View>
      </View>
    </Pressable>
  );
}
