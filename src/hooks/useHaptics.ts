import * as Haptics from 'expo-haptics';

export default function useHaptics() {
  const tap = () => Haptics.selectionAsync();
  const hold = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const send = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  const cancel = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return { tap, hold, send, cancel };
}
