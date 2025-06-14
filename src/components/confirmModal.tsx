import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

interface ConfirmModalProps {
  visible: boolean;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  message,
  confirmText,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <BlurView
        intensity={40}
        tint="dark"
        className="flex-1 justify-center items-center"
      >
        <View className="bg-zinc-900 rounded-2xl py-6 px-5 w-72 items-center">
          <Text className="text-lg font-semibold text-zinc-100 text-center mb-6">
            {message}
          </Text>
          <TouchableOpacity
            className="bg-zinc-800 rounded-xl py-3 w-full items-center mb-3"
            onPress={onConfirm}
          >
            <Text className="text-red-500 text-lg font-semibold">
              {confirmText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-zinc-700 bg-transparent rounded-xl py-3 w-full items-center"
            onPress={onCancel}
          >
            <Text className="text-zinc-400 text-lg font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}
