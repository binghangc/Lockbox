import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Text, TextInput, View, TextInputProps, Platform } from 'react-native';
import { useTripTheme } from '@/context/TripThemeProvider';
import { BlurView } from 'expo-blur';

interface FormInputProps extends TextInputProps {
  label?: string;
  icon?: ReactNode;
}

export default function FormInput({ label, icon, ...props }: FormInputProps) {
  const theme = useTripTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Determine tint value without nested ternary
  let blurTint: 'default' | 'light' = 'default';
  if (Platform.OS !== 'android' && isFocused) {
    blurTint = 'light';
  }

  return (
    <View className="mb-4">
      {label && (
        <Text style={{ color: theme.primaryText, marginBottom: 8 }}>
          {label}
        </Text>
      )}
      <BlurView
        intensity={40}
        tint={blurTint}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: theme.secondaryOutline,
          backgroundColor:
            Platform.OS === 'android' && isFocused
              ? `${theme.background}88`
              : `${theme.secondaryBackground}55`,
          overflow: 'hidden',
        }}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          style={{
            flex: 1,
            color: theme.primaryText,
            paddingVertical: 12,
          }}
          placeholderTextColor={theme.secondaryText}
          autoCorrect={false}
          autoCapitalize="none"
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          keyboardType={props.keyboardType}
          secureTextEntry={props.secureTextEntry}
          editable={props.editable}
          maxLength={props.maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </BlurView>
    </View>
  );
}
