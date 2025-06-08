import { View, Text, TouchableOpacity } from 'react-native';
import { Octicons, Ionicons, Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { UserContext } from '@/components/UserContext';

type SettingItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  hasChevron?: boolean;
};

export default function ProfileSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const context = useContext(UserContext);
  if (!context) return null;
  const { logout } = context;

  function SettingItem({
    icon,
    label,
    onPress,
    hasChevron = true,
  }: SettingItemProps) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-row items-center">
          {icon}
          <Text className="text-white text-lg font-semibold ml-3">{label}</Text>
        </View>
        {hasChevron && (
          <Octicons
            name="chevron-right"
            size={24}
            color="white"
            style={{ opacity: 0.6 }}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className="flex-1 px-5"
      style={{
        backgroundColor: 'rgb(17, 17, 17)',
        paddingTop: insets.top + 60,
      }}
    >
      <BlurView
        intensity={50}
        tint="dark"
        style={{ borderRadius: 5, overflow: 'hidden' }}
      >
        <SettingItem
          label="Account Settings"
          icon={<MaterialIcons name="settings" size={24} color="white" />}
          onPress={() => router.push('./accountSettings')}
        />
        <View
          style={{ height: 1, backgroundColor: '#2a2a2a', marginHorizontal: 4 }}
        />
        <SettingItem
          label="Notifications"
          icon={<Ionicons name="notifications" size={24} color="white" />}
          onPress={() => router.push('/notifications')}
        />
      </BlurView>
      <BlurView
        intensity={50}
        tint="dark"
        style={{ borderRadius: 5, overflow: 'hidden', marginTop: 32 }}
      >
        <SettingItem
          label="Log out"
          icon={<Feather name="log-out" size={24} color="white" />}
          onPress={async () => {
            console.log('Logging out user...');
            await logout(); // clear tokens & state
            router.replace('/(auth)'); // jump to auth stack index
          }}
          hasChevron={false}
        />
      </BlurView>
    </View>
  );
}
