import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';

export default function DatePicker() {
  return (
    <BlurView intensity={50} tint='dark' className="flex-1 items-center justify-center">
      <View className="bg-white/10 p-6 rounded-xl items-center justify-center">
        <Text className="text-white text-xl">Date Picker Modal</Text>
      </View>
    </BlurView>
  );
}
