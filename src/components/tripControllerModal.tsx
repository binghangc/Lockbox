import React, { useRef } from 'react';
import { View, Platform } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TripControllerItem from '@/components/tripControllerItem';
import { useTripTheme } from '@/context/TripThemeProvider';

type TripControllerModalProps = {
  status: 'upcoming' | 'ongoing' | 'ended';
  isHost: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onItinerary: () => void;
  onSync: () => void;
  onPin: () => void;
  onInvite: () => void;
  onDelete: () => void;
  onLeave: () => void;
  onVault: () => void;
  triggerRef: React.RefObject<Modalize | null>;
};

export default function TripControllerModal({
  status,
  isPinned,
  onEdit,
  onItinerary,
  onSync,
  onPin,
  onInvite,
  onDelete,
  onLeave,
  onVault,
  triggerRef,
}: TripControllerModalProps) {
  const modalRef = useRef<Modalize>(null);
  const theme = useTripTheme();

  // Expose open method on triggerRef
  React.useImperativeHandle(triggerRef, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  return (
    <Modalize
      ref={modalRef}
      modalStyle={{
        backgroundColor: 'transparent',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
      overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      handleStyle={{ backgroundColor: '#636366', width: 40, height: 5 }}
      handlePosition="inside"
      adjustToContentHeight
    >
      <BlurView
        intensity={200}
        tint={theme.blurTint as 'light' | 'dark' | 'default'}
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: 'hidden',
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 24,
          ...(Platform.OS === 'android' && {
            backgroundColor: `${theme.secondaryBackground}`,
          }),
        }}
      >
        <View className="mt-3">
          <TripControllerItem
            icon={
              <Ionicons
                name="calendar-clear"
                size={20}
                color={theme.primaryIcon}
              />
            }
            label="Sync to Calendar"
            onPress={onSync}
          />
        </View>
        {isHost && status === 'upcoming' && (
          <TripControllerItem
            icon={
              <Foundation name="pencil" size={20} color={theme.primaryIcon} />
            }
            label="Edit Trip"
            onPress={onEdit}
          />
        )}
        {isHost && status === 'ongoing' && (
          <TripControllerItem
            icon={
              <FontAwesome5 name="tasks" size={20} color={theme.primaryIcon} />
            }
            label="Edit Itinerary"
            onPress={onItinerary}
          />
        )}
        <TripControllerItem
          icon={
            <MaterialIcons
              name="push-pin"
              size={20}
              color={theme.primaryIcon}
            />
          }
          label={isPinned ? 'Unpin Trip' : 'Pin Trip'}
          onPress={onPin}
        />
        {isHost && status !== 'ended' && (
          <TripControllerItem
            icon={
              <FontAwesome5
                name="user-plus"
                size={15}
                color={theme.primaryIcon}
              />
            }
            label="Send Invites"
            onPress={onInvite}
          />
        )}
        <TripControllerItem
          icon={
            <Ionicons name="lock-open" size={20} color={theme.primaryIcon} />
          }
          label="Open Vault"
          onPress={onVault}
        />
        <TripControllerItem
          icon={
            isHost ? (
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color="#FF3B30"
              />
            ) : (
              <FontAwesome5 name="running" size={20} color="#FF3B30" />
            )
          }
          label={isHost ? 'Delete Trip' : 'Leave Trip'}
          onPress={isHost ? onDelete : onLeave}
        />
      </BlurView>
    </Modalize>
  );
}
