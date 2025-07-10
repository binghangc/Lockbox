import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTripTheme } from '@/context/TripThemeProvider';

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

  return (
    <BlurView
      intensity={60}
      tint={theme.blurTint as 'light' | 'dark'}
      experimentalBlurMethod="dimezisBlurView"
      className="absolute top-0 left-0 right-0 z-10"
    >
      <SafeAreaView style={{ paddingTop: insets.top + 20 }}>
        <View className="flex-row justify-between items-center px-4 py-2 mb-2">
          <TouchableOpacity onPress={onCancel}>
            <Text style={{ color: theme.primaryText }} className="text-base font-semibold">Cancel</Text>
          </TouchableOpacity>

          <Text style={{ color: theme.primaryText }} className="text-xl font-bold">{title}</Text>

          <TouchableOpacity onPress={onSave}>
            <Text style={{ color: theme.primaryText }} className="text-base font-semibold">Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  );
}
