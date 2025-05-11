import { TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';


export type LocationPickerModalRef = {
    open: () => void;
    close: () => void;
  };

  const LocationPickerModal = forwardRef<LocationPickerModalRef>((_, ref) => {
    const modalRef = useRef<Modalize>(null);
    const insets = useSafeAreaInsets();
  
    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }));
  
    return (
      <Modalize
        ref={modalRef}
        adjustToContentHeight={true}
        handleStyle={{ backgroundColor: '#ccc' }}
        handlePosition="inside"
        disableScrollIfPossible={true}
        modalStyle={{ backgroundColor: 'transparent' }}
      >
        <BlurView
          intensity={60}
          tint="dark"
          style={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            minHeight: 810,
            flex: 1,
          }}
        >
          <View className="flex-row items-center justify-between mb-4 mt-3">
            <TouchableOpacity onPress={() => modalRef.current?.close()}>
              <Text className="text-white text-md font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white font-bold text-xl">Location</Text>
            <View style={{ width: 50 }} />
          </View>

          <View className="bg-white/10 border border-white/20 rounded-md px-3 py-2 flex-row items-center">
            <Octicons name="search" size={19} color="white" />
            <TextInput
              placeholder="Country, City, or Place"
              placeholderTextColor="#aaa"
              className="text-white flex-1 ml-2"
            />
          </View>
        </BlurView>
      </Modalize>
    );
  });
  
  export default LocationPickerModal;
  