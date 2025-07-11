import React, { forwardRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';
import videoBackgrounds from '@/constants/videoBackgrounds';
import { useTripTheme } from '@/context/TripThemeProvider';

export type BackgroundPickerModalRef = Modalize;

type Props = {
  onSelect: (key: string) => void;
  selectedKey: string | null;
};

const BackgroundPickerModal = forwardRef<BackgroundPickerModalRef, Props>(
  ({ onSelect, selectedKey }, ref) => {
    const theme = useTripTheme();

    return (
      <Modalize
        ref={ref}
        modalStyle={[
          styles.modal,
          {
            backgroundColor: 'transparent',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: 'hidden',
          },
        ]}
        adjustToContentHeight
        handleStyle={{ backgroundColor: theme.optionalText }}
        handlePosition="inside"
        panGestureComponentEnabled
        panGestureEnabled
        withHandle
        threshold={40}
        velocity={100}
        overlayStyle={{ backgroundColor: 'transparent' }}
      >
        <BlurView
          intensity={60}
          tint={theme.blurrierTint as 'light' | 'dark'}
          style={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            backgroundColor: (() => {
              if (Platform.OS === 'ios') {
                return 'transparent';
              }

              if (theme.blurrierTint === 'light') {
                return 'rgba(255, 255, 255, 0.85)';
              }

              return 'rgba(0, 0, 0, 0.8)';
            })(),
          }}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primaryText }]}>
              Theme
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {Object.entries(videoBackgrounds).map(([key, { thumbnail }]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  onSelect(key);
                }}
                style={[
                  styles.item,
                  selectedKey === key && {
                    borderColor: theme.primaryOutline,
                  },
                ]}
              >
                <Image source={thumbnail} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BlurView>
      </Modalize>
    );
  },
);

BackgroundPickerModal.displayName = 'BackgroundPickerModal';

export default BackgroundPickerModal;

const styles = StyleSheet.create({
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  item: {
    marginRight: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 35,
    borderColor: 'transparent',
  },
  selected: {},
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
