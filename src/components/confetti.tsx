import React, { createContext, useContext, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { View, StyleSheet } from 'react-native';
import confettiJson from '../../assets/animations/confetti.json';

const ConfettiContext = createContext<() => void>(() => {});
export const useConfetti = () => useContext(ConfettiContext);

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const animationRef = useRef<LottieView>(null);

  const triggerConfetti = React.useCallback(() => {
    animationRef.current?.play(0, 120);
  }, []);

  return (
    <ConfettiContext.Provider value={triggerConfetti}>
      {children}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}
      >
        <LottieView
          ref={animationRef}
          source={confettiJson}
          autoPlay={false}
          loop={false}
          resizeMode="cover"
        />
      </View>
    </ConfettiContext.Provider>
  );
}
