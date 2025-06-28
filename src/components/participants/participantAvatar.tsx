import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
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
        <View className="absolute -top-2 -left-2">
          <FontAwesome6 name="crown" size={24} color="#a3a3a3" />
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
