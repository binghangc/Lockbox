import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ChangeEmailModalRef = Modalize;

type ChangeEmailModalProps = {
  onConfirm: (email: string) => void;
};

const ChangeEmailModal = forwardRef<Modalize, ChangeEmailModalProps>(
  ({ onConfirm }, ref) => {
    const insets = useSafeAreaInsets();
    const modalRef = ref as React.RefObject<Modalize>;
    const [email, setEmail] = useState('');

    const isValid = email.includes('@') && email.length >= 5;

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
        onClose={() => setEmail('')}
      >
        <View
          style={{
            padding: 20,
            minHeight: 350,
            backgroundColor: 'rgb(18, 18, 18)',
            paddingBottom: 12,
          }}
        >
          <Text className="text-white text-xl font-bold text-center mb-4 mt-3">
            Change Email
          </Text>

          <Text className="text-white text-sm mb-2">New email address</Text>
          <TextInput
            className="text-white text-md border border-white/20 rounded-md mb-4"
            placeholder="you@example.com"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={{
              height: 48,
              paddingHorizontal: 16,
              paddingVertical: 0,
              includeFontPadding: false,
              textAlignVertical: 'center',
            }}
          />

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
            <Text className="text-white text-sm opacity-70">
              A confirmation email will be sent to both your new and current
              email addresses - please accept both links accordingly.
            </Text>
          </View>

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
              disabled={!isValid}
              style={{
                backgroundColor: '#FF4C4C',
                opacity: isValid ? 1 : 0.4,
                borderRadius: 5,
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
              onPress={() => {
                onConfirm(email);
                modalRef.current?.close();
              }}
            >
              <Text className="text-white font-semibold text-base">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    );
  },
);

ChangeEmailModal.displayName = 'ChangeEmailModal';

export default ChangeEmailModal;
