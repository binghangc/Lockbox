import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePillbarConfig from '@/constants/pillbarConfig';
import videoBackgrounds from '@/constants/videoBackgrounds';
import { useTripTheme } from '@/context/TripThemeProvider';
import BackgroundPickerModal, {
  BackgroundPickerModalRef,
} from './backgroundPickerModal';

export default function TripStylePillbar({
  onPressTheme,
  onPressEffect,
  selectedBackgroundKey,
  onSelectBackground,
}: {
  onPressTheme: (key: string) => void;
  onPressEffect: () => void;
  selectedBackgroundKey: string | null;
  onSelectBackground: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const PILLBAR = usePillbarConfig();

  const backgroundModalRef = useRef<BackgroundPickerModalRef>(null);

  const openBackgroundPicker = () => {
    backgroundModalRef.current?.open();
  };

  return (
    <>
      <View
        style={{
          position: PILLBAR.CONTAINER_POSITION,
          bottom: insets.bottom + PILLBAR.CONTAINER_BOTTOM_OFFSET,
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
                paddingVertical: PILLBAR.PILLBAR_PADDING_VERTICAL - 5,
                backgroundColor:
                  Platform.OS === 'android'
                    ? `${theme.secondaryBackground}DD`
                    : 'transparent',
              }}
            >
              <TouchableOpacity
                onPress={openBackgroundPicker}
                className="py-1.5 px-3 rounded-full items-center"
              >
                <View
                  style={{
                    borderRadius: 9999,
                    borderWidth: 1,
                    borderColor: theme.primaryOutline,
                    padding: 3,
                  }}
                >
                  <Image
                    source={
                      selectedBackgroundKey
                        ? videoBackgrounds[selectedBackgroundKey]?.thumbnail
                        : undefined
                    }
                    style={{
                      width: 25,
                      height: 25,
                      borderRadius: 9999,
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
                onPress={onPressEffect}
                className="py-1.5 px-3 rounded-full"
              >
                <Text
                  className="text-[12px] font-light"
                  style={{ color: theme.primaryText }}
                >
                  Effect
                </Text>
              </TouchableOpacity>
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
    </>
  );
}
