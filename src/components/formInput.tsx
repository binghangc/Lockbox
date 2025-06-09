import React from 'react';
import { Text, TextInput, View, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  ..._rest
}: FormInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-white mb-2">{label}</Text>
      <TextInput
        className="bg-neutral-800 text-white px-4 py-3 rounded-md w-full"
        placeholderTextColor="#888"
        autoCapitalize="none"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}
