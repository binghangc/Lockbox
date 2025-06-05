import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';
import InviteFriendsModal from "@/components/inviteFriendsModal";

export default function TripPillbar({ tripId, isHost }: { tripId: string, isHost: boolean }) {
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    const handleInvitePress = () => {
        if (!isHost) {
            Alert.alert("Access Denied", "Only the host can invite people to this trip.");
            return;
        }
    
        setInviteModalOpen(true);
    };

    return (
        <>
            {/* Pillbar */}
            <View className="absolute bottom-5 w-[95%] self-center z-50">
                <BlurView
                    intensity={40}
                    tint="dark"
                    className="rounded-full px-6 py-6 border border-white/10 flex-row justify-between items-center bg-white/5 overflow-hidden"
                >
                    {[
                        { name: 'edit', label: 'Edit' },
                        { name: 'bell', label: 'Notify' },
                        { name: 'camera', label: 'Capture' },
                        { name: 'user-plus', label: 'Invite', onPress: handleInvitePress },
                        { name: 'ellipsis-h', label: 'More' },
                    ].map((item, idx) => (
                        <TouchableOpacity 
                            key={idx} 
                            className="items-center justify-center"
                            onPress={item.onPress ?? (() => {})}
                        >
                            <FontAwesome5 name={item.name} size={16} color="#fff" />
                            <Text className="text-[11px] text-[#d4d4d4] mt-1">{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </BlurView>
            </View>

            {/* Invite Modal */}
            <InviteFriendsModal
                tripId={tripId}
                visible={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
            />
        </>

    );
}