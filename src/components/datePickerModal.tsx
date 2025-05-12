import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { View, TouchableOpacity } from 'react-native';
import React, { forwardRef } from 'react';
import { Text } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';

export type DatePickerModalRef = Modalize;

const DatePickerModal = forwardRef<Modalize, { onConfirm?: (range: { startDate: string | null; endDate: string | null }) => void }>((props, ref) => {
  const { onConfirm } = props;
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

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const range = end.diff(start, 'day');

      for (let i = 0; i <= range; i++) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');

        let isStart = i === 0;
        let isEnd = i === range;

        marked[date] = {
          customStyles: {
            container: {
              backgroundColor: 'rgba(175, 252, 237, 0.2)',
              borderTopLeftRadius: isStart ? 20 : 0,
              borderBottomLeftRadius: isStart ? 20 : 0,
              borderTopRightRadius: isEnd ? 20 : 0,
              borderBottomRightRadius: isEnd ? 20 : 0,
              width: '100%',
            },
            text: {
              color: isStart || isEnd ? '#b1ffef' : 'white',
              fontWeight: isStart || isEnd ? '700' : '500',
            }
          }
        };
      }
    } else if (startDate) {
      marked[startDate] = {
        customStyles: {
          container: {
            backgroundColor: 'rgba(175, 252, 237, 0.2)',
            borderRadius: 20,
          },
          text: {
            color: '#b1ffef',
            fontWeight: '700',
          }
        }
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
        <TouchableOpacity
          onPress={() => {
            setStartDate(null);
            setEndDate(null);
          }}
          className="absolute top-5 left-5 z-10"
        >
          <Text className="text-white font-semibold text-base mt-4">Clear</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold text-center mb-4 mt-3">Select Dates</Text>
        {/* Date tab bar */}
        <View className="flex-row justify-between items-center mb-4 mt-3">
          <View className="flex-1 bg-white/10 px-5 py-4 rounded-lg mr-2 min-h-[70px] justify-center">
            <Text className="text-white text-lg font-semibold mb-1">Start</Text>
            <Text className="text-white text-xl font-bold">
              {startDate ? dayjs(startDate).format('ddd, MMM D') : 'Select'}
            </Text>
          </View>
          <View className="flex-1 bg-white/10 px-5 py-4 rounded-lg ml-2 min-h-[70px] justify-center">
            <Text className="text-white text-lg font-semibold mb-1">End</Text>
            <Text className="text-white text-xl font-bold">
              {(startDate && !endDate) ? dayjs(startDate).format('ddd, MMM D') :
               endDate ? dayjs(endDate).format('ddd, MMM D') : 'Select'}
            </Text>
          </View>
        </View>
        <Calendar
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          markingType={'custom'}
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
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: 12,
            paddingBottom: 12,
            paddingHorizontal: 24,
            backgroundColor: 'black',
            borderTopWidth: 1,
            borderTopColor: '#444',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (onConfirm) onConfirm({ startDate, endDate });
              if (ref && 'current' in ref && ref.current) {
                ref.current.close();
              }
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: 5,
              paddingVertical: 12,
              paddingHorizontal: 24,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-end',
              marginBottom: 20, // adds space above iPhone home bar

            }}
          >
            <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>Done</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modalize>
  );
});

export default DatePickerModal;