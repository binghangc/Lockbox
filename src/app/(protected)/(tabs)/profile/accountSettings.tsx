import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Entypo,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeleteAccountModal, {
  DeleteAccountModalRef,
} from '@/components/deleteAccountModal';
import ChangeSettingsModal, {
  ChangeSettingsModalRef,
} from '@/components/changeSettingsModal';
import { useUser } from '@/context/UserContext';

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();

  const changeSettingsRef = useRef<ChangeSettingsModalRef>(null);
  const [settingType, setSettingType] = useState<'email' | 'password' | null>(
    null,
  );

  const deleteModalRef = useRef<DeleteAccountModalRef>(null);
  const { updateEmail, updatePassword, deleteAccount } = useUser();

  function handleConfirmChange(value: string) {
    if (settingType === 'email') updateEmail(value);
    else if (settingType === 'password') updatePassword(value);
  }

  function SettingItem({
    icon,
    label,
    onPress,
    hasChevron = true,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    hasChevron?: boolean;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-row items-center">
          {icon}
          <Text className="text-white text-lg font-semibold ml-3">{label}</Text>
        </View>
        {hasChevron && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="white"
            style={{ opacity: 0.6 }}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className="flex-1 px-5"
      style={{
        backgroundColor: 'rgb(17, 17, 17)',
        paddingTop: insets.top + 60,
      }}
    >
      <BlurView
        intensity={50}
        tint="dark"
        style={{ borderRadius: 5, overflow: 'hidden' }}
      >
        <SettingItem
          icon={<Entypo name="email" size={24} color="white" />}
          label="Change email"
          onPress={() => {
            setSettingType('email');
            changeSettingsRef.current?.open();
          }}
        />
        <View
          style={{ height: 1, backgroundColor: '#2a2a2a', marginHorizontal: 4 }}
        />
        <SettingItem
          icon={<MaterialIcons name="password" size={24} color="white" />}
          label="Change password"
          onPress={() => {
            setSettingType('password');
            changeSettingsRef.current?.open();
          }}
        />
      </BlurView>
      <BlurView
        intensity={50}
        tint="dark"
        style={{ borderRadius: 5, overflow: 'hidden', marginTop: 32 }}
      >
        <TouchableOpacity
          className="flex-row items-center px-4 py-4"
          onPress={() => deleteModalRef.current?.open()}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={24}
            color="#FF4C4C"
          />
          <Text
            style={{
              color: '#FF4C4C',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 12,
            }}
          >
            Delete Account
          </Text>
        </TouchableOpacity>
      </BlurView>
      <DeleteAccountModal ref={deleteModalRef} onConfirm={deleteAccount} />
      <ChangeSettingsModal
        ref={changeSettingsRef}
        title={settingType === 'email' ? 'Change Email' : 'Change Password'}
        label={settingType === 'email' ? 'New email address' : 'New password'}
        placeholder={settingType === 'email' ? 'you@example.com' : '••••••••'}
        submitButtonText="Confirm"
        onConfirm={() => handleConfirmChange}
      />
    </View>
  );
}
