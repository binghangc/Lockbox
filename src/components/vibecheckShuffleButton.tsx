import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

type Props = {
  onPress?: () => void;
  disabled?: boolean;
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
  },
});

export default function VibecheckShuffleButton({
  onPress = () => {},
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && { opacity: 0.5 }]}
      activeOpacity={0.8}
    >
      <FontAwesome6 name="shuffle" size={14} color="white" />
    </TouchableOpacity>
  );
}
