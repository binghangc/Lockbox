import { Text, TouchableOpacity, Image, View } from 'react-native';
import { Trip } from '@/types';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HostRow from './hostRow';

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const router = useRouter();

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        className="w-72"
        onPress={() => router.push(`/trips/${trip.id}`)}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: trip.thumbnail_url }}
            className="w-full aspect-square mb-1"
            resizeMode="cover"
          />
          {trip.is_host && (
            <BlurView
              intensity={50}
              tint="dark"
              style={{
                position: 'absolute',
                bottom: 3,
                right: 0,
                paddingHorizontal: 10,
                paddingVertical: 8,
                overflow: 'hidden',
                zIndex: 10,
              }}
            >
              <Text className="text-white text-base font-bold">👑 HOSTING</Text>
            </BlurView>
          )}
        </View>
        <Text className="text-white font-bold text-xl mt-2" numberOfLines={1}>
          {trip.title}
        </Text>
        <HostRow host={trip.host} className="mt-0" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => console.log('Open trip management modal')}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          width: 25,
          height: 25,
          borderRadius: 20,
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        <BlurView
          intensity={50}
          tint="dark"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={18}
            color="white"
          />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}
