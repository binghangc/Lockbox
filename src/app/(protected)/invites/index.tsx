import { TouchableOpacity, Modal } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";
import InvitesList from "@/components/invitesList";
import InviteCard from "@/components/inviteCard";
import { Invite } from "@/types"
import { Feather } from '@expo/vector-icons';

export default function InvitesScreen() {
    const router = useRouter();
    const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
    
    return (
        <>
            <Stack.Screen options={{ 
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="pl-3">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                ),
                title: "Your Invites"
            }}/>
            <InvitesList onInviteSelected={setSelectedInvite}/>
            {selectedInvite && (
                <Modal
                visible={true}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setSelectedInvite(null)}
                >
                <InviteCard
                    invite={selectedInvite}
                    onClose={() => setSelectedInvite(null)}
                />
                </Modal>
            )}
        </>

    );
}