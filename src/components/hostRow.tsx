import React from 'react';
import { View, Text, Image } from 'react-native';

interface Host {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
}

interface HostRowProps {
  host: Host;
  className?: string;
}

export default function HostRow({ host, className }: HostRowProps) {
  return (
    <View className={`flex-row items-center ${className ?? ''}`}>
      <Text className="text-neutral-400 text-sm mr-1">hosted by</Text>
      <Image
        source={{ uri: host.avatar_url }}
        className="w-7 h-7 rounded-full mr-1"
        resizeMode="cover"
      />
      <Text className="text-white text-sm">{host.username}</Text>
    </View>
  );
}