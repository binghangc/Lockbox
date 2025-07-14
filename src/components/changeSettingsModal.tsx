import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ChangeSettingsModalRef = Modalize;

type ChangeSettingsModalProps = {
  title: string;
  label: string;
  placeholder?: string;
  confirmText?: string; // optional enforced confirmation word like "DELETE"
  submitButtonText?: string;
  infoNote?: string;
  onConfirm: (value: string) => void;
};

const ChangeSettingsModal = forwardRef<Modalize, ChangeSettingsModalProps>(
  (
    {
      title,
      label,
      placeholder,
      confirmText,
      submitButtonText = 'Confirm',
      infoNote,
      onConfirm,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const modalRef = ref as React.RefObject<Modalize>;
    const [inputText, setInputText] = useState('');

    const isConfirmed = confirmText
      ? inputText === confirmText
      : inputText.length > 0;

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
        onClose={() => setInputText('')}
      >
        <View
          style={{
            padding: 20,
            minHeight: 400,
            backgroundColor: 'rgb(18, 18, 18)',
            paddingBottom: 12,
          }}
        >
          <Text className="text-white text-xl font-bold text-center mb-4 mt-3">
            {title}
          </Text>
          <Text className="text-white text-sm mb-2">{label}</Text>
          <TextInput
            className="text-white text-md border border-white/20 rounded-md mb-4"
            placeholder={placeholder || ''}
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
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

          {!!infoNote && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 20,
              }}
            >
              <Foundation
                name="info"
                size={14}
                color="rgba(255, 255, 255, 0.7)"
              />
              <Text className="text-white text-sm opacity-70">{infoNote}</Text>
            </View>
          )}

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
                onConfirm(inputText);
                modalRef.current?.close();
              }}
            >
              <Text className="text-white font-semibold text-base">
                {submitButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    );
  },
);

ChangeSettingsModal.displayName = 'ChangeSettingsModal';

export default ChangeSettingsModal;
