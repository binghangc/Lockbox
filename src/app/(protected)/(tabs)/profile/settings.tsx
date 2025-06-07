

import { View, Text, TouchableOpacity } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SettingItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  hasChevron?: boolean;
};

export default function ProfileSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const SettingItem = ({ icon, label, onPress, hasChevron = true }: SettingItemProps) => (
    <BlurView intensity={50} tint="dark" style={{ marginVertical: 6, borderRadius: 12, overflow: 'hidden' }}>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-row items-center">
          {icon}
          <Text className="text-white text-lg font-semibold ml-3">{label}</Text>
        </View>
        {hasChevron && (
          <Octicons name="chevron-right" size={24} color="white" style={{ opacity: 0.6 }} />
        )}
      </TouchableOpacity>
    </BlurView>
  );

  return (
    <View className="flex-1 px-5" style={{ backgroundColor: 'rgb(17, 17, 17)', paddingTop: insets.top + 60 }}>
      <SettingItem
        label="Account Settings"
        icon={<MaterialIcons name="settings" size={24} color="white" />}
        onPress={() => router.push('/accountSettings')}
      />
      <SettingItem
        label="Notifications"
        icon={<Ionicons name="notifications" size={24} color="white" />}
        onPress={() => router.push('/notifications')}
      />
      <SettingItem
        label="Log out"
        icon={<Feather name="log-out" size={24} color="white" />}
        onPress={() => {
          // handle logout logic
        }}
        hasChevron={false}
      />
    </View>
  );
}