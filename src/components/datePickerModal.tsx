import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { View } from 'react-native';
import React, { forwardRef } from 'react';
import { Text } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';

export type DatePickerModalRef = Modalize;

const DatePickerModal = forwardRef<Modalize>((_, ref) => {
  const [startDate, setStartDate] = React.useState<string | null>(null);
  const [endDate, setEndDate] = React.useState<string | null>(null);

  const onDayPress = (day: { dateString: string }) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
    } else if (day.dateString < startDate) {
      setStartDate(day.dateString);
    } else {
      setEndDate(day.dateString);
    }
  };

  const getMarkedDates = () => {
    let marked: any = {};

    if (startDate) {
      marked[startDate] = {
        startingDay: true,
        color: '#4f46e5',
        textColor: 'white',
      };
    }

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const range = end.diff(start, 'day');

      for (let i = 1; i < range; i++) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');
        marked[date] = { color: '#a5b4fc', textColor: 'white' };
      }

      marked[endDate] = {
        endingDay: true,
        color: '#4f46e5',
        textColor: 'white',
      };
    }

    return marked;
  };

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
        <Text className="text-white text-xl mb-4">Select Trip Dates</Text>
        <Calendar
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          markingType={'period'}
          theme={{
            calendarBackground: 'transparent',
            dayTextColor: '#fff',
            textDisabledColor: '#666',
            monthTextColor: '#fff',
            arrowColor: '#fff',
          }}
        />
      </BlurView>
    </Modalize>
  );
});

export default DatePickerModal;