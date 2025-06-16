import React, { useRef } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';
import {
  Foundation,
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

type TripControllerModalProps = {
  isHost: boolean;
  onEdit: () => void;
  onSync: () => void;
  onPin: () => void;
  onInvite: () => void;
  onDelete: () => void;
  onLeave: () => void;
  triggerRef: React.RefObject<Modalize | null>;
};

export default function TripControllerModal({
  isHost,
  onEdit,
  onSync,
  onPin,
  onInvite,
  onDelete,
  onLeave,
  triggerRef,
}: TripControllerModalProps) {
  const modalRef = useRef<Modalize>(null);

  // Expose open method on triggerRef
  React.useImperativeHandle(triggerRef, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  function renderItem({
    icon,
    label,
    onPress,
    hasChevron = false,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    hasChevron?: boolean;
  }) {
    return (
      <TouchableOpacity onPress={onPress} className="px-3 mb-3">
        <View style={{ borderRadius: 4, overflow: 'hidden' }}>
          <BlurView
            intensity={60}
            tint="dark"
            style={{
              borderRadius: 30,
              paddingVertical: 16,
              paddingHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View className="flex-row items-center">
              <View className="w-6 h-6 rounded-md items-center justify-center mr-2">
                {icon}
              </View>
              <Text
                className={`text-lg font-semibold ${
                  label === 'Delete Trip' || label === 'Leave Trip'
                    ? 'text-[#FF3B30]'
                    : 'text-white'
                }`}
              >
                {label}
              </Text>
            </View>
            {hasChevron && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="white"
                style={{ opacity: 0.6 }}
              />
            )}
          </BlurView>
        </View>
      </TouchableOpacity>
    );
  }

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
        intensity={60}
        tint="dark"
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: 'hidden',
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        <View className="mt-3">
          {renderItem({
            icon: <Ionicons name="calendar-clear" size={20} color="white" />,
            label: 'Sync to Calendar',
            onPress: onSync,
          })}
        </View>
        {isHost &&
          renderItem({
            icon: <Foundation name="pencil" size={20} color="white" />,
            label: 'Edit Trip',
            onPress: onEdit,
          })}
        {isHost &&
          renderItem({
            icon: <MaterialIcons name="push-pin" size={20} color="white" />,
            label: 'Pin Trip',
            onPress: onPin,
          })}
        {isHost &&
          renderItem({
            icon: <FontAwesome5 name="user-plus" size={15} color="white" />,
            label: 'Send Invites',
            onPress: onInvite,
          })}
        {!isHost &&
          renderItem({
            icon: <MaterialIcons name="push-pin" size={20} color="white" />,
            label: 'Pin Trip',
            onPress: onPin,
          })}
        {renderItem({
          icon: isHost ? (
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={24}
              color="#FF3B30"
            />
          ) : (
            <FontAwesome5 name="running" size={20} color="#FF3B30" />
          ),
          label: isHost ? 'Delete Trip' : 'Leave Trip',
          onPress: isHost ? onDelete : onLeave,
        })}
      </BlurView>
    </Modalize>
  );
}
