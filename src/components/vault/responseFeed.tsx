import { View, Text, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTripTheme } from '@/context/TripThemeProvider';

interface ResponseFeedProps {
  vibecheckId: string;
  style?: ViewStyle;
}

export default function ResponseFeed({
  vibecheckId,
  style,
}: ResponseFeedProps) {
  const theme = useTripTheme();

  return (
    <BlurView
      intensity={60}
      tint={theme.blurrierTint as 'light' | 'dark'}
      style={[{ flex: 1 }, style]}
    >
      <View
        style={{
          paddingTop: 20,
        }}
      >
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.secondaryOutline,
            paddingBottom: 12,
            paddingHorizontal: 20,
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.primaryText,
              textAlign: 'left',
            }}
          >
            Responses
          </Text>
        </View>
      </View>
    </BlurView>
  );
}
