// components/ProfileHeader.tsx
import React from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Octicons, Foundation, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface ProfileHeaderProps {
  title: string;
  showRightIcons?: boolean;
}

export default function ProfileHeader({
  title,
  showRightIcons = false,
}: ProfileHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={60}
      experimentalBlurMethod="dimezisBlurView"
      className="absolute top-0 left-0 right-0 z-10"
    >
      <SafeAreaView style={{ paddingTop: insets.top + 20 }}>
        <View
          className="flex-row justify-between items-center"
          style={{ pointerEvents: 'auto' }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 20 }}
          >
            <Octicons name="chevron-left" size={28} color="white" />
          </TouchableOpacity>

          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
            {title}
          </Text>

          {showRightIcons ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('profileEdit')}
                style={{ marginRight: 16 }}
              >
                <Foundation name="pencil" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/profile/settings')}
                style={{ marginRight: 16 }}
              >
                <MaterialIcons name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: 10 }} /> // spacer to balance left icon
          )}
        </View>
      </SafeAreaView>
    </BlurView>
  );
}
