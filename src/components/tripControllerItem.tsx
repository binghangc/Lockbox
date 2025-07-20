import { useTripTheme } from '@/context/TripThemeProvider';
import React from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
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
  const theme = useTripTheme();
  return (
    <TouchableOpacity onPress={onPress} className="px-3 mb-3">
      <View style={{ borderRadius: 4, overflow: 'hidden' }}>
        <BlurView
          intensity={60}
          tint={theme.blurTint as 'light' | 'dark' | 'default'}
          style={[
            {
              borderRadius: 0,
              paddingVertical: 16,
              paddingHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            Platform.OS === 'android' && {
              backgroundColor: theme.secondaryOutline,
            },
          ]}
        >
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-md items-center justify-center mr-2">
              {icon}
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color:
                  label === 'Delete Trip' || label === 'Leave Trip'
                    ? '#FF3B30'
                    : theme.primaryText,
              }}
            >
              {label}
            </Text>
          </View>
          {hasChevron && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.secondaryIcon}
              style={{ opacity: 0.6 }}
            />
          )}
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}
