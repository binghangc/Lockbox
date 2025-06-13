import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const responses = [
  {
    label: 'Going',
    emoji: '✅',
    gradient: ['#60a5fa', '#c084fc'] as [string, string],
  },
  {
    label: 'Maybe',
    emoji: '🤔',
    gradient: ['#a78bfa', '#f472b6'] as [string, string],
  },
  {
    label: 'Not Going',
    emoji: '❌',
    gradient: ['#f472b6', '#ec4899'] as [string, string],
  },
];

const CIRCLE_SIZE = 120;
const GLOW_MARGIN = 6;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  shadowWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    shadowColor: '#ffffff',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10, // Android glow
    backgroundColor: 'white',
  },
  blur: {
    flex: 1,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  gradient: {
    width: CIRCLE_SIZE - GLOW_MARGIN,
    height: CIRCLE_SIZE - GLOW_MARGIN,
    borderRadius: (CIRCLE_SIZE - GLOW_MARGIN) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  emojiStack: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function InviteResponseBar({
  onSelect,
}: {
  onSelect: (status: 'going' | 'maybe' | 'not_going') => void;
}) {
  return (
    <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-4 px-6">
      {responses.map((r) => (
        <Pressable
          key={r.label}
          onPress={() =>
            onSelect(
              r.label.toLowerCase().replace(' ', '_') as
                | 'going'
                | 'maybe'
                | 'not_going',
            )
          }
          style={[
            styles.shadowWrapper,
            { marginHorizontal: 6 }, // <-- proper spacing between each
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.blur}>
            <LinearGradient colors={r.gradient} style={styles.gradient}>
              <Text style={styles.emoji}>{r.emoji}</Text>
              <Text style={styles.text}>{r.label}</Text>
            </LinearGradient>
          </BlurView>
        </Pressable>
      ))}
    </View>
  );
}
