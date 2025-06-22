import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  bubbleContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: -12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bubbleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    overflow: 'hidden',
  },
});

export default function TripPillbar({
  status,
  isHost,
  handlePress,
  ongoingPillText,
  bottomAccessory,
}: {
  status: 'upcoming' | 'ongoing' | 'ended';
  isHost: boolean;
  handlePress: () => void;
  ongoingPillText?: string;
  bottomAccessory?: React.ReactNode;
}) {
  console.log('TripPillbar rendered with status:', status);
  const insets = useSafeAreaInsets();

  let mainActionIcon;

  if (status === 'upcoming') {
    mainActionIcon = <Text className="text-3xl">✨</Text>;
  } else if (status === 'ongoing') {
    mainActionIcon = <Text className="text-3xl">🎥</Text>;
  } else if (status === 'ended') {
    mainActionIcon = <Text className="text-3xl">🔓</Text>;
  }

  let pillText = '';
  if (status === 'upcoming') {
    pillText = isHost
      ? 'Superpower your vibechecks with our vibe genie'
      : 'Vibes are brewing';
  } else if (status === 'ongoing') {
    pillText = ongoingPillText;
  } else if (status === 'ended') {
    pillText = 'View your memories';
  }

  return (
    <>
      {/* Pillbar */}
      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
          zIndex: 999,
        }}
      >
        <LinearGradient
          start={[0, 0.5]}
          end={[1, 0.5]}
          locations={[0, 0.5, 1]}
          colors={[
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.1)',
          ]}
          style={{ borderRadius: 9999, padding: 1 }}
        >
          <View style={{ overflow: 'hidden', borderRadius: 9999 }}>
            <BlurView
              intensity={50}
              tint="dark"
              className="rounded-full px-8 py-3 flex-row justify-center items-center bg-white/5"
              experimentalBlurMethod={
                Platform.OS === 'android' ? 'dimezisBlurView' : undefined
              }
              style={[
                { overflow: 'hidden', borderRadius: 9999, minHeight: 48 },
              ]}
            >
              <View className="flex-row items-center">
                {/* Gradient bubble around icon */}
                <TouchableOpacity
                  onPress={handlePress}
                  style={styles.bubbleContainer}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    start={[0.2, 0.2]}
                    end={[0.8, 0.8]}
                    colors={[
                      'rgba(255,255,255,0.25)',
                      'rgba(255,255,255,0.05)',
                      'rgba(255,255,255,0)',
                    ]}
                    style={styles.bubbleGradient}
                  />
                  {mainActionIcon}
                </TouchableOpacity>

                {/* Pill text */}
                <Text className="text-gray-100 text-xl font-semibold flex-1">
                  {pillText}
                </Text>

                {bottomAccessory && (
                  <View className="ml-2">{bottomAccessory}</View>
                )}
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
