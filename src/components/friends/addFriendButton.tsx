
import { TouchableOpacity, Text, Animated } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from "react";

export default function AddFriendButton({
    isRequestSent,
    onPress,
}: {
    isRequestSent: boolean;
    onPress: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isRequestSent) {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
        }
    }, [isRequestSent]);

    if (isRequestSent) {
        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Feather name="check" size={20} color="#4ade80" />
            </Animated.View>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-gray-700 px-3 py-1 rounded-md"
        >
            <Text className="text-white font-semibold text-sm">ADD</Text>
        </TouchableOpacity>
    );
}