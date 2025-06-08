import { Animated, Easing, Dimensions } from 'react-native';
import { useEffect, useRef, useMemo } from 'react';

const { width, height } = Dimensions.get('window');

type FloatingOrbProps = {
  top: number;
  left: number;
  size?: number;
  color?: string;
  shadowColor?: string;
};

const orbColors = [
  { color: 'bg-purple-500/20', shadow: '#a855f7' },
  { color: 'bg-pink-400/30', shadow: '#f472b6' },
  { color: 'bg-blue-400/30', shadow: '#60a5fa' },
  { color: 'bg-emerald-400/30', shadow: '#34d399' },
  { color: 'bg-orange-400/30', shadow: '#fb923c' },
];

export default function FloatingOrb() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  const { top, left, color, shadow } = useMemo(() => {
    const { color, shadow } =
      orbColors[Math.floor(Math.random() * orbColors.length)];
    const top = Math.random() * (height * 0.5);
    const left = Math.random() * (width - 150);
    return { top, left, color, shadow };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        transform: [{ translateY: floatAnim }],
        shadowColor: shadow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 30,
      }}
      className={`absolute w-40 h-40 rounded-full blur-3xl opacity-70 shadow-2xl ${color}`}
    />
  );
}
