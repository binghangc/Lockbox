import { TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';
import countries from 'world-countries';
import { BlurView } from 'expo-blur';


export type LocationPickerModalRef = {
    open: () => void;
    close: () => void;
  };

  const LocationPickerModal = forwardRef<LocationPickerModalRef, { onSelectCountry: (country: { name: string; flag: string }) => void }>(
    ({ onSelectCountry }, ref) => {
    const modalRef = useRef<Modalize>(null);
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = countries.filter((country) =>
      country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getEmojiFlag = (countryCode: string) =>
      countryCode
        .toUpperCase()
        .replace(/./g, (char) =>
          String.fromCodePoint(char.charCodeAt(0) + 127397)
        );
  
    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }), []);
  
    return (
      <Modalize
        ref={modalRef}
        adjustToContentHeight={false}
        handleStyle={{ backgroundColor: '#ccc' }}
        handlePosition="inside"
        modalStyle={{ backgroundColor: 'transparent' }}
        modalTopOffset={45}
        customRenderer={(scrollViewProps: any) => (
          <BlurView
            intensity={60}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          >
            <ScrollView
              {...scrollViewProps}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 20,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}
              >
                <View className="flex-row items-center justify-between mb-4 mt-3">
                  <TouchableOpacity onPress={() => modalRef.current?.close()}>
                    <Text className="text-white text-md font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <Text className="text-white font-bold text-xl">Location</Text>
                  <View style={{ width: 50 }} />
                </View>
  
                <View className="bg-white/10 border border-white/20 rounded-md px-3 py-2 flex-row items-center mb-3">
                  <Octicons name="search" size={19} color="#aaa" />
                  <TextInput
                    placeholder="Search countries"
                    placeholderTextColor="#aaa"
                    className="text-white flex-1 ml-2"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>
              {filteredCountries.map((item) => (
                <TouchableOpacity
                  key={item.cca2}
                  className="py-3 px-2 border-b border-white/10"
                  onPress={() => {
                    onSelectCountry({
                      name: item.name.common,
                      flag: getEmojiFlag(item.cca2),
                    });
                  }}
                >
                  <Text className="text-white text-xl">
                    {getEmojiFlag(item.cca2)} {item.name.common}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: insets.bottom }} />
            </ScrollView>
          </BlurView>
        )}
      />
    );
  });
  
  export default LocationPickerModal;