import { View, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTripTheme } from '@/context/TripThemeProvider';

interface FloatingButtonProps {
  onPress?: () => void;
  icon?: string;
  style?: ViewStyle;
}

export default function FloatingButton({
  onPress,
  icon = '⏳',
  style,
}: FloatingButtonProps) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 24,
        right: 24,
        zIndex: 1000,
        elevation: 12,
        ...(style || {}),
      }}
      pointerEvents="box-none"
    >
      <TouchableOpacity onPress={onPress} style={{ zIndex: 1001 }}>
        <LinearGradient
          colors={theme.mainBubbleGradient}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.primaryOutline,
          }}
        >
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
