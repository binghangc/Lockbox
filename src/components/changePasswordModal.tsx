import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Foundation } from '@expo/vector-icons';

export type ChangePasswordModalRef = Modalize;

type Props = {
  onConfirm: (current: string, next: string, confirm: string) => void;
};

const ChangePasswordModal = forwardRef<Modalize, Props>(
  ({ onConfirm }, ref) => {
    const insets = useSafeAreaInsets();
    const modalRef = ref as React.RefObject<Modalize>;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isValid =
      newPassword.length >= 6 &&
      newPassword === confirmPassword &&
      currentPassword.length > 0;

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
        onClose={() => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
      >
        <View
          style={{
            padding: 20,
            minHeight: 550,
            backgroundColor: 'rgb(18, 18, 18)',
            paddingBottom: 12,
          }}
        >
          <Text className="text-white text-xl font-bold text-center mb-6 mt-3">
            Change Password
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text className="text-white text-sm mb-2">Current Password</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                paddingHorizontal: 12,
              }}
            >
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                placeholderTextColor="#888"
                secureTextEntry={!showCurrent}
                style={{
                  flex: 1,
                  height: 48,
                  color: 'white',
                }}
              />
              <TouchableOpacity onPress={() => setShowCurrent((prev) => !prev)}>
                <Feather
                  name={showCurrent ? 'eye' : 'eye-off'}
                  size={16}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text className="text-white text-sm mb-2">New Password</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                paddingHorizontal: 12,
              }}
            >
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                placeholderTextColor="#888"
                secureTextEntry={!showNew}
                style={{
                  flex: 1,
                  height: 48,
                  color: 'white',
                }}
              />
              <TouchableOpacity onPress={() => setShowNew((prev) => !prev)}>
                <Feather
                  name={showNew ? 'eye' : 'eye-off'}
                  size={16}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text className="text-white text-sm mb-2">
              Confirm New Password
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                paddingHorizontal: 12,
              }}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#888"
                secureTextEntry={!showConfirm}
                style={{
                  flex: 1,
                  height: 48,
                  color: 'white',
                }}
              />
              <TouchableOpacity onPress={() => setShowConfirm((prev) => !prev)}>
                <Feather
                  name={showConfirm ? 'eye' : 'eye-off'}
                  size={16}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>
          </View>

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
              Passwords must consist of at least 8 characters and include
              uppercase, lowercase, and special characters, and digits.
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
              onPress={() => {
                onConfirm(currentPassword, newPassword, confirmPassword);
                modalRef.current?.close();
              }}
              style={{
                backgroundColor: '#FF4C4C',
                opacity: isValid ? 1 : 0.4,
                borderRadius: 5,
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
            >
              <Text className="text-white font-semibold text-base">
                Change Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    );
  },
);

ChangePasswordModal.displayName = 'ChangePasswordModal';

export default ChangePasswordModal;
