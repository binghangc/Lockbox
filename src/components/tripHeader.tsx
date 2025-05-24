

import { View, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';

type TripHeaderProps = {
  onBack?: () => void;
};

export default function TripHeader({ onBack }: TripHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={30}
      tint="dark"
      className="absolute top-0 left-0 right-0 z-10"
      style={{ height: insets.top}}
    >
      <View className="flex-row justify-between items-center px-4 h-[60]">
        <TouchableOpacity onPress={onBack}>
          <Octicons name="chevron-left" size={25} color="white" />
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}