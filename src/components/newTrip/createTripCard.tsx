import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

const rotatingThumbnails = require('../../../assets/animations/rotatingThumbnails.json');

export default function CreateTripCard() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(protected)/tripForm?mode=create')}
      className="w-72 items-center"
    >
      <View className="w-72 aspect-square border-2 border-dashed border-neutral-500 justify-center items-center bg-transparent">
        <LottieView
          source={rotatingThumbnails}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
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
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>+ New trip</Text>
        </View>
      </View>
    </Pressable>
  );
}
