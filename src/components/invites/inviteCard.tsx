import React from 'react';
import { Text, TouchableOpacity, Image, View } from 'react-native';
import { Invite } from '@/types';
import { FontAwesome6 } from '@expo/vector-icons';

export default function InviteCard({ invite }: { invite: Invite }) {
  return (
    <View className="flex-1 bg-black">
      <View className="px-4">
        <View className="flex-1 justify-between">
          <View className="w-full items-center justify-between pt-6 pb-4">
            <Text className="text-white text-center text-2xl font-bold">
              You&apos;re Invited!
            </Text>
            <View className="w-7" />
          </View>

          <Image
            source={{ uri: invite.trip.thumbnail_url }}
            className="w-full aspect-square mb-1"
            resizeMode="cover"
          />

          <Text className="text-white text-3xl font-bold mb-2">
            {invite.trip.title}
          </Text>
          <View className="flex-row items-center">
            <FontAwesome6 name="crown" size={15} color="#a3a3a3" />
            <Text className="text-neutral-400 text-xl ml-2">Hosted by</Text>
          </View>
          {invite.trip.host && (
            <TouchableOpacity
              className="flex-row items-center gap-3 mt-2 ml-4"
              onPress={() => {}}
            >
              <Image
                source={{ uri: invite.trip.host.avatar_url }}
                className="w-10 h-10 rounded-full"
              />
              <Text className="text-white text-xl font-bold">
                {invite.trip.host.username}
              </Text>
            </TouchableOpacity>
          )}
          {invite.trip.country && (
            <View className="flex-row items-center mt-4 ml-[2px]">
              <FontAwesome6 name="location-dot" size={15} color="#a3a3a3" />
              <Text className="text-neutral-400 text-xl ml-2">
                {invite.trip.country}
              </Text>
            </View>
          )}

          {invite.trip.description && (
            <Text className="text-neutral-400 text-lg mt-4">
              {invite.trip.description}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
