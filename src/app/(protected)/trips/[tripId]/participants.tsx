import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ParticipantsList from '@/components/participants/participantsList';
import { useUser } from '@/components/UserContext';
import { Profile } from '@/types';
import { useState } from 'react';
import UserProfileModal from '@/components/userProfileModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParticipantsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [participantCount, setParticipantCount] = useState(0);

  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pl-3">
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <View
        className="flex-1 bg-black px-4 pt-6"
        style={{ flex: 1, paddingTop: insets.top + 60 }}
      >
        <View className="mb-6 flex-1">
          <Text className="text-s text-gray-400 font-semibold mb-2">
            PARTICIPANTS ({participantCount})
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
        currentUserId={user?.id}
        isFriends
      />
    </>
  );
}
