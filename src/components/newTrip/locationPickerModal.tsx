import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';
import countries from 'world-countries';
import { BlurView } from 'expo-blur';
import { useTripTheme } from '@/context/TripThemeProvider';

export type LocationPickerModalRef = {
  open: () => void;
  close: () => void;
};

function LocationPickerModalHeader({
  searchQuery,
  setSearchQuery,
  onClose,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
}) {
  const theme = useTripTheme();
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: 'transparent',
      }}
    >
      <View className="flex-row items-center justify-center mb-4 relative">
        <TouchableOpacity
          onPress={onClose}
          style={{ position: 'absolute', left: -20 }}
        >
          <Text
            style={{
              color: theme.secondaryText,
              fontWeight: '600',
              fontSize: 14,
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: theme.primaryText,
            fontWeight: '700',
            fontSize: 20,
          }}
        >
          Location
        </Text>
      </View>
      <View
        style={{
          borderColor: theme.secondaryOutline,
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Octicons
          name="search"
          size={18}
          color={theme.secondaryIcon}
          style={{ marginTop: 1 }}
        />
        <TextInput
          placeholder="Search countries"
          placeholderTextColor={theme.secondaryText}
          style={{
            color: theme.primaryText,
            flex: 1,
            marginLeft: 8,
            fontSize: 16,
            fontWeight: '400',
            minHeight: 20,
          }}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );
}

type LocationPickerModalContentProps = {
  insets: { bottom: number };
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredCountries: typeof countries;
  onSelectCountry: (country: { name: string; flag: string }) => void;
  getEmojiFlag: (countryCode: string) => string;
  contentRef: React.RefObject<ScrollView>;
};

function LocationPickerModalContent({
  insets,
  searchQuery,
  setSearchQuery,
  filteredCountries,
  onSelectCountry,
  getEmojiFlag,
  contentRef,
}: LocationPickerModalContentProps) {
  const theme = useTripTheme();
  return (
    <View
      style={{
        flex: 1,
        minHeight: 810,
        overflow: 'hidden',
      }}
    >
      <BlurView
        pointerEvents="none"
        intensity={60}
        tint={theme.blurrierTint as 'light' | 'dark' | 'default'}
        experimentalBlurMethod="dimezisBlurView"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: 'hidden',
          },
        ]}
      />
      <ScrollView
        ref={contentRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 0,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {filteredCountries.map((item) => (
          <TouchableOpacity
            key={item.cca2}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.secondaryOutline,
            }}
            onPress={() => {
              onSelectCountry({
                name: item.name.common,
                flag: getEmojiFlag(item.cca2),
              });
            }}
          >
            <Text style={{ color: theme.primaryText, fontSize: 20 }}>
              {getEmojiFlag(item.cca2)} {item.name.common}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </View>
  );
}

LocationPickerModalContent.displayName = 'LocationPickerModalContent';

const LocationPickerModal = forwardRef<
  LocationPickerModalRef,
  { onSelectCountry: (country: { name: string; flag: string }) => void }
>(({ onSelectCountry }, ref) => {
  const modalRef = useRef<Modalize>(null);
  const insets = useSafeAreaInsets();
  const theme = useTripTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<ScrollView>(null);

  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getEmojiFlag = (countryCode: string) =>
    countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(char.charCodeAt(0) + 127397),
      );

  useImperativeHandle(
    ref,
    () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }),
    [],
  );

  return (
    <Modalize
      ref={modalRef}
      handleStyle={{ backgroundColor: '#ccc' }}
      handlePosition="inside"
      modalStyle={{
        backgroundColor: 'transparent',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: 'hidden',
      }}
      modalTopOffset={45}
      panGestureEnabled={false}
      panGestureComponentEnabled
      HeaderComponent={
        <BlurView
          intensity={60}
          tint={theme.blurrierTint as 'light' | 'dark' | 'default'}
          experimentalBlurMethod="dimezisBlurView"
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            paddingTop: 20,
            paddingHorizontal: 20,
            overflow: 'hidden',
          }}
        >
          <LocationPickerModalHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClose={() => modalRef.current?.close()}
          />
        </BlurView>
      }
    >
      <LocationPickerModalContent
        insets={insets}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCountries={filteredCountries}
        onSelectCountry={onSelectCountry}
        getEmojiFlag={getEmojiFlag}
        contentRef={contentRef}
      />
    </Modalize>
  );
});

LocationPickerModal.displayName = 'LocationPickerModal';

export default LocationPickerModal;
