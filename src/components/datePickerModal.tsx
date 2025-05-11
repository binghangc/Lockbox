import React, { forwardRef } from 'react';
import { Text } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';

export type DatePickerModalRef = Modalize;

const DatePickerModal = forwardRef<Modalize>((_, ref) => {
    return (
      <Modalize
        ref={ref}
        adjustToContentHeight
        handleStyle={{ backgroundColor: '#ccc' }}
        handlePosition="inside"
        disableScrollIfPossible={true}
        modalStyle={{ backgroundColor: 'transparent' }}
      >
        <BlurView
          intensity={60}
          tint="dark"
          style={{
            padding: 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            minHeight: 810,
          }}
        >
          <Text className="text-white text-xl">Date Picker</Text>
        </BlurView>
      </Modalize>
    );
  });
  
  export default DatePickerModal;
  