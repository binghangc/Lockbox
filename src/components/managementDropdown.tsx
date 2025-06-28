import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface DropdownProps {
  visible: boolean;
  position: { x: number; y: number; width: number; height: number };
  isHost: boolean;
  onDelete: () => void;
  onLeave: () => void;
  onClose: () => void;
}

const MENU_WIDTH = 120;

export default function ManagementDropdown({
  visible,
  position,
  isHost,
  onDelete,
  onLeave,
  onClose,
}: DropdownProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <BlurView
        intensity={50}
        tint="dark"
        style={
          {
            position: 'absolute',
            top: position.y + position.height + 4,
            left: position.x + position.width - MENU_WIDTH,
            width: MENU_WIDTH,
            borderRadius: 8,
            paddingVertical: 1,
            overflow: 'hidden',
            zIndex: 30,
          } as ViewStyle
        }
      >
        {isHost ? (
          <TouchableOpacity
            onPress={() => {
              onDelete();
              onClose();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color="#FF4C4C"
            />
            <Text className="text-[#FF4C4C] font-bold ml-2">Delete Trip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              onLeave();
              onClose();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
          >
            <FontAwesome5 name="running" size={18} color="#FF4C4C" />
            <Text className="text-[#FF4C4C] font-bold ml-2">Leave Trip</Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </Modal>
  );
}
