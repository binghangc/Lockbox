import React from 'react';
import { View, Text, Switch } from 'react-native';

interface SubToggleProps {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  icon: React.ReactNode;
}

export default function SubToggle({
  label,
  value,
  onChange,
  icon,
}: SubToggleProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-4">
      <View className="flex-row items-center">
        {icon}
        <Text className="text-white text-lg font-semibold ml-3">{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(next) => {
          console.log(`${label} toggled to`, next);
          onChange(next);
        }}
      />
    </View>
  );
}
