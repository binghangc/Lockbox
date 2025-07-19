import React from 'react';
import { useTripTheme } from '@/context/TripThemeProvider';
import { View, Text } from 'react-native';
import ParticipantAvatar from '@/components/participants/participantAvatar';
import useParticipants from '@/hooks/useParticipants';
import { Profile } from '@/types';

type Props = {
  onSelect: (user: Profile) => void | Promise<void>;
  onCountUpdate?: (count: number) => void;
};

export default function ParticipantRowList({ onSelect, onCountUpdate }: Props) {
  const theme = useTripTheme();
  const { participants, loading } = useParticipants(onCountUpdate);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: theme.primaryText }} className="mb-4">
          Fetching your travel buddies...
        </Text>
        <View className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </View>
    );
  }

  // Extract profiles from participant data and remove duplicates
  const profiles = participants.map((p) => p.profile).filter(Boolean);
  const unique = Array.from(new Map(profiles.map((p) => [p.id, p])).values());
  const visible = unique.slice(0, 4);

  if (visible.length === 0) {
    return (
      <View className="flex-row items-center">
        <Text style={{ color: theme.secondaryText }}>No participants yet</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-row items-center space-x-3"
      style={{ backgroundColor: 'transparent' }}
    >
      {visible.map((profile, idx) => (
        <ParticipantAvatar
          key={profile.id || idx}
          name={profile.name}
          avatarUrl={profile.avatar_url}
          size={48}
          isHost={
            participants.find((p) => p.profile.id === profile.id)?.role ===
            'host'
          }
          onPress={() => onSelect?.(profile)}
        />
      ))}
    </View>
  );
}
