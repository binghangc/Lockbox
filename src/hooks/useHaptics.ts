import * as Haptics from 'expo-haptics';

export default function useHaptics() {
  const tap = () => Haptics.selectionAsync();
  const hold = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  return { tap, hold };
}
