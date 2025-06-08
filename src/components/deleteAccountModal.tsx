import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type DeleteAccountModalRef = Modalize;

const DeleteAccountModal = forwardRef<Modalize>((_, ref) => {
  const insets = useSafeAreaInsets();
  const modalRef = ref as React.RefObject<Modalize>;
  const [confirmationText, setConfirmationText] = useState('');

  const isConfirmed = confirmationText === 'DELETE';

  return (
    <Modalize
      ref={ref}
      adjustToContentHeight
      handleStyle={{ backgroundColor: '#ccc' }}
      handlePosition="inside"
      modalStyle={{ backgroundColor: 'transparent' }}
      modalTopOffset={45}
      scrollViewProps={{ scrollEnabled: false }}
      withReactModal
      onClose={() => setConfirmationText('')}
    >
      <View
        style={{
          padding: 20,
          minHeight: 400,
          backgroundColor: 'rgb(18, 18, 18)',
          paddingBottom: 12,
        }}
      >
        <Text className="text-white text-xl font-bold text-center mb-4 mt-3">Delete account</Text>
        <Text className="text-white text-base text-left mb-6">
          This action is permanent. All your data including profile, trips, and friends will be permanently deleted.
        </Text>

        <Text className="text-white text-sm mb-2">Type "DELETE" to confirm</Text>
        <TextInput
          className="text-white text-md border border-white/20 rounded-md mb-4"
          placeholder="DELETE"
          placeholderTextColor="#888"
          value={confirmationText}
          onChangeText={setConfirmationText}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          style={{
            height: 48,
            paddingHorizontal: 16,
            paddingVertical: 0,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Foundation name="info" size={14} color="rgba(255, 255, 255, 0.7)" />
          <Text className="text-white text-sm opacity-70">
            You'll be signed out once deletion is complete.
          </Text>
        </View>

      {/* Footer-style action bar pinned to bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          paddingHorizontal: 24,
          backgroundColor: 'black',
          borderTopWidth: 1,
          borderTopColor: '#444',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => modalRef.current?.close()}>
          <Text className="text-white font-semibold text-base">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!isConfirmed}
          style={{
            backgroundColor: '#FF4C4C',
            opacity: isConfirmed ? 1 : 0.4,
            borderRadius: 5,
            paddingVertical: 12,
            paddingHorizontal: 20,
          }}
          onPress={() => {
            // Handle deletion logic
          }}
        >
          <Text className="text-white font-semibold text-base">Delete account</Text>
        </TouchableOpacity>
      </View>
      </View>
    </Modalize>
  );
});

export default DeleteAccountModal;