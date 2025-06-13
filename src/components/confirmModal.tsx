import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface ConfirmModalProps {
  visible: boolean;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#aaa',
    fontSize: 14,
  },
  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  confirmText: {
    color: '#FF4C4C',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

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
      <BlurView intensity={50} tint="dark" style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}
