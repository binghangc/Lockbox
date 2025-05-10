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
      <Text className="text-neutral-400 text-base mr-2">Hosted by</Text>
      <Image
        source={{ uri: host.avatar_url }}
        className="w-7 h-7 rounded-full mr-2"
        resizeMode="cover"
      />
      <Text className="text-neutral-400 text-base font-semibold">{host.username}</Text>
    </View>
  );
}