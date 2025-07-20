import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTripTheme } from '@/context/TripThemeProvider';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

type Props = {
  onPress?: () => void;
  loading?: boolean;
};

export default function VibecheckShuffleButton({
  onPress = () => {},
  loading = false,
}: Props) {
  const theme = useTripTheme();

  return (
    <BlurView
      intensity={40}
      tint={theme.blurTint as 'light' | 'dark' | 'default'}
      style={{
        borderColor: theme.secondaryOutline,
        borderWidth: 1,
        borderRadius: 9999,
        overflow: 'hidden',
        alignSelf: 'center',
        marginTop: 8,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        className="px-4 py-1"
        style={{ zIndex: 1, opacity: loading ? 0.5 : 1 }}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.primaryText} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FontAwesome6 name="shuffle" size={14} color={theme.primaryText} />
          </View>
        )}
      </TouchableOpacity>
    </BlurView>
  );
}
