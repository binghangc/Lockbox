import { Modal, TouchableOpacity, Dimensions, View } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Modalize } from "react-native-modalize";
import InvitesList from "@/components/invitesList";
import InviteCard from "@/components/inviteCard";
import InviteRow from '@/components/inviteRow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invite } from "@/types";


export default function InvitesScreen() {
    const router = useRouter();
    const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
    const modalRef = useRef<Modalize>(null);

    const handleInviteResponse = async (response: string, invite: Invite) => {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return Alert.alert("Error", "You're not logged in.");
      
        const endpointMap = {
            going: '/accept-invite',
            not_going: '/decline-invite',
        };
      
        const endpoint = endpointMap[response];
        if (!endpoint) return Alert.alert("Unknown response");
      
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/invites${endpoint}`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                id: invite.id,
                user_id: invite.user_id,
                trip_id: invite.trip_id,
                }),
            });
        
            const data = await res.json();
            if (!res.ok) return Alert.alert("Failed", data.error || "Something went wrong.");
        
            Alert.alert("Success", `You responded: ${response.replace('_', ' ')}`);
            setSelectedInvite(null);
        } catch (err) {
            Alert.alert("Error", "Something went wrong.");
        }
    };
    
    useEffect(() => {
        if (selectedInvite) {
            modalRef.current?.open();
        } else {
            modalRef.current?.close();
        }
    }, [selectedInvite]);
    
    return (
        <View className="flex-1 relative bg-black">
            <Stack.Screen 
                options={{ 
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="pl-3">
                            <Feather name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                    title: "Your Invites"
                }}
            />
            <InvitesList onInviteSelected={setSelectedInvite}/>
            <Modalize
                ref={modalRef}
                adjustToContentHeight={false}
                modalHeight={Dimensions.get("window").height - 100}
                withHandle={false}
                onClosed={() => setSelectedInvite(null)}
                modalStyle={{ backgroundColor: "black" }}
                scrollViewProps={{
                    contentContainerStyle: {
                      flexGrow: 1,
                      paddingBottom: 100, // Leave space for fixed InviteRow
                    },
                    showsVerticalScrollIndicator: false,
                }}
                FooterComponent={
                    <View className="px-4 pb-6 pt-3">
                      <InviteRow
                        onSelect={(response) => handleInviteResponse(response, selectedInvite)}
                      />
                    </View>
                }
            >
                {selectedInvite && (
                    <View className="flex-1 relative">
                        {/* content */}
                        <InviteCard
                            invite={selectedInvite}
                            onClose={() => modalRef.current?.close()}
                        />
                    </View>
                )}
            </Modalize>
        </View>

    );
}
