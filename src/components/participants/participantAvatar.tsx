import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTripTheme } from '@/context/TripThemeProvider';
import defaultAvatar from '../../../assets/defaultavatar.jpg';

type ParticipantAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  isHost?: boolean;
  onPress: () => void;
};

export default function ParticipantAvatar({
  name,
  avatarUrl,
  size = 60,
  isHost = false,
  onPress,
}: ParticipantAvatarProps) {
  const theme = useTripTheme();
  return (
    <TouchableOpacity
      className="items-center justify-center mx-2 my-1"
      onPress={onPress}
    >
      <Image
        source={avatarUrl ? { uri: avatarUrl } : defaultAvatar}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        className="bg-neutral-700"
      />
      {isHost && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            transform: [{ translateX: 6 }, { translateY: -15 }],
          }}
        >
          <MaterialCommunityIcons
            name="crown-circle"
            size={24}
            color={theme.secondaryIcon}
          />
        </View>
      )}
      <Text
        className="text-white text-sm mt-1 text-center"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
