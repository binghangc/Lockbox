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
        color: '#affced',
        textColor: 'black',
      };
    }

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const range = end.diff(start, 'day');

      for (let i = 1; i < range; i++) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');
        marked[date] = { color: 'rgba(175, 252, 237, 0.2)', textColor: 'white' };
      }

      marked[endDate] = {
        endingDay: true,
        color: '#affced',
        textColor: 'black',
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
        <Text className="text-white text-xl font-bold text-center mb-4 mt-3">Select Dates</Text>
        <Calendar
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          markingType={'period'}
          enableSwipeMonths={true}
          minDate={dayjs().format('YYYY-MM-DD')}
          hideExtraDays={true}
          theme={{
            calendarBackground: 'transparent',
            dayTextColor: '#fff',
            todayTextColor: '#affced',
            selectedDayBackgroundColor: '#99CCCC',
            selectedDayTextColor: '#affced',
            textDisabledColor: '#666',
            monthTextColor: '#fff',
            arrowColor: '#fff',
            textDayFontWeight: '400',
            textMonthFontWeight: '400',
            textDayHeaderFontWeight: '400',
          }}
        />
      </BlurView>
    </Modalize>
  );
});

export default DatePickerModal;