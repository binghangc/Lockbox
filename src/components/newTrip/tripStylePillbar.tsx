import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePillbarConfig from '@/constants/pillbarConfig';
import { useTripTheme } from '@/context/TripThemeProvider';
import BackgroundPickerModal, {
  BackgroundPickerModalRef,
} from './backgroundPickerModal';

export default function TripStylePillbar({
  onPressTheme,
  onPressEffect,
}: {
  onPressTheme: (key: string) => void;
  onPressEffect: () => void;
}) {
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
  const PILLBAR = usePillbarConfig();

  const backgroundModalRef = useRef<BackgroundPickerModalRef>(null);

  const [selectedBackgroundKey, setSelectedBackgroundKey] = useState<string | null>(null);

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
          <View style={{ overflow: 'hidden', borderRadius: 9999 }}>
            <BlurView
              intensity={PILLBAR.BLUR_INTENSITY}
              tint={PILLBAR.BLUR_TINT as 'light' | 'dark' | 'default'}
              className="rounded-full flex-row justify-around items-center bg-white/5"
              style={{
                minHeight: PILLBAR.PILLBAR_HEIGHT,
                paddingHorizontal: PILLBAR.PILLBAR_PADDING_HORIZONTAL,
                paddingVertical: PILLBAR.PILLBAR_PADDING_VERTICAL,
              }}
            >
              <TouchableOpacity
                onPress={openBackgroundPicker}
                style={styles.pillButton}
              >
                <Text style={[styles.pillText, { color: theme.primaryText }]}>
                  Theme
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onPressEffect}
                style={styles.pillButton}
              >
                <Text style={[styles.pillText, { color: theme.primaryText }]}>
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
          setSelectedBackgroundKey(key);
          onPressTheme?.(key);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pillButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '300',
  },
});
