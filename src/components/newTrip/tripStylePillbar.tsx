import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePillbarConfig from '@/constants/pillbarConfig';
import videoBackgrounds from '@/constants/videoBackgrounds';
import effects from '@/constants/effects';
import { useTripTheme } from '@/context/TripThemeProvider';
import BackgroundPickerModal, {
  BackgroundPickerModalRef,
} from './backgroundPickerModal';
import EffectPickerModal, { EffectPickerModalRef } from './effectPickerModal';

export default function TripStylePillbar({
  onPressTheme,
  onPressEffect,
  selectedBackgroundKey,
  selectedEffectKey,
  onSelectBackground,
  onSelectEffect,
}: {
  onPressTheme: (key: string) => void;
  onPressEffect: (key: string) => void;
  selectedBackgroundKey: string | null;
  selectedEffectKey: string | null;
  onSelectBackground: (key: string) => void;
  onSelectEffect: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const PILLBAR = usePillbarConfig();

  const backgroundModalRef = useRef<BackgroundPickerModalRef>(null);
  const effectModalRef = useRef<EffectPickerModalRef>(null);

  const openBackgroundPicker = () => {
    backgroundModalRef.current?.open();
  };

  const openEffectPicker = () => {
    effectModalRef.current?.open();
  };

  return (
    <>
      <View
        style={{
          position: PILLBAR.CONTAINER_POSITION,
          bottom: insets.bottom,
          left: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          right: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          zIndex: PILLBAR.CONTAINER_Z_INDEX,
        }}
        className=""
      >
        <LinearGradient
          start={PILLBAR.GRADIENT_START}
          end={PILLBAR.GRADIENT_END}
          locations={PILLBAR.GRADIENT_LOCATIONS}
          colors={PILLBAR.GRADIENT_COLORS as [string, string, string]}
          style={{
            borderRadius: PILLBAR.BORDER_RADIUS_FULL,
            padding: PILLBAR.GRADIENT_PADDING,
          }}
        >
          <View className="overflow-hidden rounded-full">
            <BlurView
              intensity={PILLBAR.BLUR_INTENSITY}
              tint={PILLBAR.BLUR_TINT as 'light' | 'dark' | 'default'}
              className="rounded-full flex-row justify-around items-center bg-white/5"
              style={{
                minHeight: PILLBAR.PILLBAR_HEIGHT,
                paddingHorizontal: PILLBAR.PILLBAR_PADDING_HORIZONTAL,
                paddingVertical: PILLBAR.PILLBAR_PADDING_VERTICAL - 10,
                backgroundColor:
                  Platform.OS === 'android'
                    ? `${theme.secondaryBackground}DD`
                    : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 85 }}>
                <TouchableOpacity
                  onPress={openBackgroundPicker}
                  className="py-1.5 px-0.5 rounded-full items-center"
                >
                  <View
                    style={{
                      borderRadius: 99999,
                      borderWidth: 1,
                      borderColor: theme.primaryOutline,
                      padding: 3,
                    }}
                  >
                    <Image
                      source={
                        selectedBackgroundKey &&
                        videoBackgrounds[selectedBackgroundKey]?.thumbnail
                          ? videoBackgrounds[selectedBackgroundKey]?.thumbnail
                          : undefined
                      }
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                      }}
                    />
                  </View>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: theme.primaryText }}
                  >
                    Theme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openEffectPicker}
                  className="py-1.5 px-0.5 rounded-full items-center"
                >
                  <View
                    style={{
                      borderRadius: 99999,
                      borderWidth: 1,
                      borderColor: theme.primaryOutline,
                      padding: 3,
                    }}
                  >
                    {selectedEffectKey &&
                    effects[selectedEffectKey]?.thumbnail ? (
                      <Image
                        source={effects[selectedEffectKey].thumbnail}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: theme.iconBackground,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Feather
                          name="slash"
                          size={14}
                          color={theme.primaryText}
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: theme.primaryText }}
                  >
                    Effect
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </View>
      <BackgroundPickerModal
        ref={backgroundModalRef}
        selectedKey={selectedBackgroundKey}
        onSelect={(key) => {
          onSelectBackground(key);
          onPressTheme?.(key);
        }}
      />
      <EffectPickerModal
        ref={effectModalRef}
        selectedKey={selectedEffectKey}
        onSelect={(key) => {
          onSelectEffect(key);
          onPressEffect?.(key);
        }}
      />
    </>
  );
}
