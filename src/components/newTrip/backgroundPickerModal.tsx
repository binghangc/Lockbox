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
            backgroundColor:
              Platform.OS === 'android'
                ? theme.secondaryBackground
                : 'transparent',
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
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={60}
            tint={theme.blurrierTint as 'light' | 'dark'}
            style={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              backgroundColor: 'transparent',
            }}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.primaryText }]}>
                Themes
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
        ) : (
          <View
            style={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              backgroundColor: `${theme.secondaryBackground}55`,
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
          </View>
        )}
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
