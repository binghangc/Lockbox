import { Animated, Easing, View, Image } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function FloatingAvatar({ uri }: { uri: string }) {
    const glowAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
        Animated.sequence([
            Animated.timing(glowAnim, {
            toValue: 1.4,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
            }),
        ])
        ).start();
    }, []);

    return (
        <View className="items-center justify-center mb-6 relative">
        {/* Animated glowing orb behind the avatar */}
        <Animated.View
            style={{
                position: "absolute",
                width: 144, // w-36
                height: 144,
                borderRadius: 9999,
                transform: [{ scale: glowAnim }],
            }}
        >
            <LinearGradient
                colors={['#c084fc33', '#8b5cf633', '#ec489933']} // soft purple to pink gradient
                start={{ x: 0.3, y: 0.3 }}
                end={{ x: 0.7, y: 0.7 }}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 9999,
                }}
            />
        </Animated.View>
        {/* User avatar */}
        <Image
            source={{ uri }}
            className="w-40 h-40 rounded-full z-10"
        />
        </View>
  );
}
