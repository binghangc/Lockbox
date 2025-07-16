import { View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Stack, useLocalSearchParams } from 'expo-router';
import ParticipantsList from '@/components/participants/participantsList';
import { useUser } from '@/context/UserContext';
import { Profile, Trip } from '@/types';
import { useState } from 'react';
import UserProfileModal from '@/components/userProfileModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripThemeProvider, useTripTheme } from '@/context/TripThemeProvider';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import useTrips from '@/hooks/useTrips';

function ParticipantsContent({ trip }: { trip: Trip }) {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();

  const bgKey = trip?.video_background ?? null;

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: 'Participants',
          headerBackground: () => (
            <BlurView
              intensity={60}
              tint={theme.blurTint as 'light' | 'dark'}
              experimentalBlurMethod="none"
              style={{
                flex: 1,
                backgroundColor:
                  Platform.OS === 'android'
                    ? `${theme.secondaryBackground}EE`
                    : undefined,
              }}
            />
          ),
        }}
      />
      <TripVisualBackground videoKey={bgKey} effectKey={null} />
      <BlurView
        intensity={60}
        tint={theme.blurTint as 'light' | 'dark' | 'default'}
        experimentalBlurMethod="dimezisBlurView"
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <View
          className="flex-1 px-4 pt-6"
          style={{
            paddingTop: insets.top + 60,
            backgroundColor: 'transparent',
          }}
        >
          <View className="mb-6 flex-1">
            <Text
              style={{
                color: theme.secondaryText,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8,
              }}
            >
              Participants ({participantCount})
            </Text>
            <ParticipantsList
              onSelect={(selectedParticipant) => {
                setSelectedUser(selectedParticipant);
              }}
              onCountUpdate={setParticipantCount}
            />
          </View>
        </View>
        <UserProfileModal
          isVisible={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          currentUserId={user?.id ?? ''}
          isFriends
        />
      </BlurView>
    </>
  );
}

export default function ParticipantsScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);

  const videoKey = trip?.video_background || 'moonlight';

  return (
    <TripThemeProvider videoKey={videoKey}>
      {trip && <ParticipantsContent trip={trip} />}
    </TripThemeProvider>
  );
}
