import React from 'react';
import type { ReactNode } from 'react';
import { Text, TextInput, View, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label?: string;
  icon?: ReactNode;
}

export default function FormInput({ label, icon, ...props }: FormInputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-white mb-2">{label}</Text>}
      <View className="flex-row items-center bg-neutral-800 rounded-md px-4">
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          className="flex-1 text-white py-3"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          keyboardType={props.keyboardType}
          secureTextEntry={props.secureTextEntry}
          editable={props.editable}
          maxLength={props.maxLength}
        />
      </View>
    </View>
  );
}
