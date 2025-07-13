import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTripTheme } from '@/context/TripThemeProvider';
import videoBackgrounds from '@/constants/videoBackgrounds';

interface CreateTripHeaderProps {
  onCancel: () => void;
  onSave: () => void;
  title: string;
}

export default function CreateTripHeader({
  onCancel,
  onSave,
  title,
}: CreateTripHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const bgTheme = videoBackgrounds[theme.video_background];

  return (
    <BlurView
      intensity={60}
      tint={theme.blurTint as 'light' | 'dark'}
      experimentalBlurMethod="dimezisBlurView"
      className="absolute top-0 left-0 right-0 z-10"
      style={{
        backgroundColor:
          Platform.OS === 'android'
            ? `${theme.secondaryBackground}AA`
            : undefined,
      }}
    >
      <SafeAreaView style={{ paddingTop: insets.top + 20 }}>
        <View className="flex-row justify-between items-center px-4 py-2 mb-2">
          <TouchableOpacity
            onPress={onCancel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={{ color: theme.primaryText }}
              className="text-base font-semibold"
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <Text
            style={{ color: theme.primaryText }}
            className="text-xl font-bold"
          >
            {title}
          </Text>

          <TouchableOpacity
            onPress={onSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={{ color: bgTheme.primaryColor }}
              className="text-base font-semibold"
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  );
}
