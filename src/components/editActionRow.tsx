import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EditActionRowProps {
  onCancel: () => void;
  onSave: () => void;
}

export default function EditActionRow({
  onCancel,
  onSave,
}: EditActionRowProps) {
  return (
    <View className="flex-row justify-end space-x-4">
      <TouchableOpacity onPress={onCancel}>
        <Text className="text-gray-400">Cancel </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSave}>
        <Text className="text-blue-400 font-semibold"> Save</Text>
      </TouchableOpacity>
    </View>
  );
}
