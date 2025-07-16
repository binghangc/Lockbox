import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useRef } from 'react';

const rotatingThumbnails = require('../../../assets/animations/rotatingThumbnails.json');

export default function CreateTripCard() {
  const router = useRouter();
  const largeLottieRef = useRef<LottieView>(null);

  return (
    <Pressable
      onPress={() => router.push('/(protected)/tripForm?mode=create')}
      className="w-72 items-center"
    >
      <View className="w-72 aspect-square border-2 border-dashed border-neutral-500 justify-center items-center bg-transparent">
        <MaskedView
          style={{
            position: 'absolute',
            width: 250,
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          maskElement={
            <Svg width="250" height="250">
              <Defs>
                <RadialGradient
                  id="grad"
                  cx="50%"
                  cy="50%"
                  r="100%"
                  fx="50%"
                  fy="50%"
                >
                  <Stop offset="0%" stopColor="transparent" stopOpacity="1" />
                  <Stop
                    offset="30%"
                    stopColor="transparent"
                    stopOpacity="0.24"
                  />
                  <Stop offset="60%" stopColor="transparent" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="250"
                height="250"
                rx="50"
                ry="50"
                fill="url(#grad)"
              />
            </Svg>
          }
        >
          <LottieView
            ref={largeLottieRef}
            source={rotatingThumbnails}
            autoPlay
            loop
            style={{
              width: 250,
              height: 250,
            }}
          />
        </MaskedView>
        <LottieView
          source={rotatingThumbnails}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 35,
            backgroundColor: 'white',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>+ New trip</Text>
        </View>
      </View>
    </Pressable>
  );
}
