import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type ItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  hasChevron?: boolean;
};

export default function TripControllerItem({
  icon,
  label,
  onPress,
  hasChevron = false,
}: ItemProps) {
  return (
    <TouchableOpacity onPress={onPress} className="px-3 mb-3">
      <View style={{ borderRadius: 4, overflow: 'hidden' }}>
        <BlurView
          intensity={60}
          tint="dark"
          style={{
            borderRadius: 30,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-md items-center justify-center mr-2">
              {icon}
            </View>
            <Text
              className={`text-lg font-semibold ${
                label === 'Delete Trip' || label === 'Leave Trip'
                  ? 'text-[#FF3B30]'
                  : 'text-white'
              }`}
            >
              {label}
            </Text>
          </View>
          {hasChevron && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="white"
              style={{ opacity: 0.6 }}
            />
          )}
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}
