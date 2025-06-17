import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function EditTripCard({
  tripId,
  thumbnail,
}: {
  tripId: string;
  thumbnail: string;
}) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/trips/${tripId}/edit`)}
      className="w-72 items-center"
    >
      <View className="w-72 aspect-square border-2 border-dashed border-neutral-500 justify-center items-center bg-transparent">
        <Image
          source={{ uri: thumbnail }}
          className="w-40 h-40"
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            bottom: 35,
            backgroundColor: 'white',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>✎ Edit trip</Text>
        </View>
      </View>
    </Pressable>
  );
}
