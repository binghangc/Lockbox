import { Modal } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";
import InvitesList from "@/components/invitesList";
import InviteCard from "@/components/inviteCard";
import { Invite } from "@/types"

export default function InvitesScreen() {
    const router = useRouter();
    const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
    
    return (
        <>
            <Stack.Screen options={{ 
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