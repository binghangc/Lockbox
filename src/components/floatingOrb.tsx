import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

export default function FloatingOrb({ 
    style, 
    color = 'bg-purple-500/20',
    shadowColor = '#a855f7', // Tailwind purple-500
 }: { 
    style?: any; 
    color?: string;
    shadowColor?: string; 
}) {
    const floatAnim = useRef(new Animated.Value(0)).current;

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
        ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                {
                transform: [{ translateY: floatAnim }],
                shadowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 30,
                },
                style,
            ]}
            className={`absolute w-40 h-40 rounded-full blur-3xl opacity-70 shadow-2xl ${color}`}
        />
    );
}
