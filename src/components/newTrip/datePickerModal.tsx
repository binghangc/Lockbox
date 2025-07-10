import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { View, TouchableOpacity, Text } from 'react-native';
import React, { forwardRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTripTheme } from '@/context/TripThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

export type DatePickerModalRef = Modalize;

const DatePickerModal = forwardRef<
  Modalize,
  {
    onConfirm: (range: {
      startDate: string | null;
      endDate: string | null;
    }) => void;
  }
>(({ onConfirm = () => {} }, ref) => {
  const inset = useSafeAreaInsets();
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
    const marked: Record<
      string,
      { customStyles: { container: object; text: object } }
    > = {};

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const range = end.diff(start, 'day');

      for (let i = 0; i <= range; i += 1) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');

        const isStart = i === 0;
        const isEnd = i === range;

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
              color: isStart || isEnd ? '#b1ffef' : theme.primaryText,
              fontWeight: isStart || isEnd ? '700' : '500',
            },
          },
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
          },
        },
      };
    }

    return marked;
  };

  const theme = useTripTheme();

  return (
    <Modalize
      ref={ref}
      adjustToContentHeight
      handleStyle={{ backgroundColor: '#ccc' }}
      handlePosition="inside"
      disableScrollIfPossible
      scrollViewProps={{ scrollEnabled: false }}
      modalStyle={{
        backgroundColor: 'transparent',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: 'hidden',
      }}
      modalTopOffset={45}
      onClose={() => {
        if (onConfirm) onConfirm({ startDate, endDate });
      }}
    >
      <BlurView
        intensity={60}
        tint={theme.blurrierTint as 'light' | 'dark' | 'default'}
        experimentalBlurMethod="dimezisBlurView"
        style={{
          padding: 20,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          minHeight: 810,
          overflow: 'hidden',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setStartDate(null);
            setEndDate(null);
          }}
          className="absolute top-5 left-5 z-10"
        >
          <Text
            style={{
              color: theme.primaryText,
              fontWeight: '600',
              fontSize: 16,
              marginTop: 16,
            }}
          >
            Clear
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: theme.primaryText,
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 16,
            marginTop: 12,
          }}
        >
          Select Dates
        </Text>
        {/* Date tab bar */}
        <View className="flex-row justify-between items-center mb-4 mt-3">
          <View className="flex-1 bg-white/10 px-5 py-4 rounded-lg mr-2 min-h-[70px] justify-center">
            <Text
              style={{
                color: theme.primaryText,
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 4,
              }}
            >
              Start
            </Text>
            <Text
              style={{
                color: theme.primaryText,
                fontSize: 20,
                fontWeight: '700',
              }}
            >
              {startDate ? dayjs(startDate).format('ddd, MMM D') : 'Select'}
            </Text>
          </View>
          <View className="flex-1 bg-white/10 px-5 py-4 rounded-lg ml-2 min-h-[70px] justify-center">
            <Text
              style={{
                color: theme.primaryText,
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 4,
              }}
            >
              End
            </Text>
            <Text
              style={{
                color: theme.primaryText,
                fontSize: 20,
                fontWeight: '700',
              }}
            >
              {(() => {
                if (startDate && !endDate) {
                  return dayjs(startDate).format('ddd, MMM D');
                }
                if (endDate) {
                  return dayjs(endDate).format('ddd, MMM D');
                }
                return 'Select';
              })()}
            </Text>
          </View>
        </View>
        <Calendar
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          markingType="custom"
          enableSwipeMonths
          minDate={dayjs().format('YYYY-MM-DD')}
          hideExtraDays
          theme={{
            calendarBackground: 'transparent',
            dayTextColor: theme.primaryText,
            todayTextColor: '#affced',
            selectedDayBackgroundColor: '#99CCCC',
            selectedDayTextColor: '#affced',
            textDisabledColor: theme.optionalText,
            monthTextColor: theme.primaryText,
            arrowColor: theme.primaryText,
            textDayFontWeight: '400',
            textMonthFontWeight: '400',
            textDayHeaderFontWeight: '400',
          }}
        />
        <LinearGradient
          colors={[`${theme.background}00`, `${theme.background}FF`]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: 150,
          }}
        >
          <View
            style={{
              paddingTop: 12,
              paddingBottom: 12,
              paddingHorizontal: 24,
              borderTopWidth: 1,
              borderTopColor: theme.secondaryOutline,
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
                backgroundColor: theme.primaryText,
                borderRadius: 5,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'flex-end',
                marginBottom: inset.bottom + 5,
              }}
            >
              <Text
                style={{
                  color: theme.background,
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </Modalize>
  );
});

DatePickerModal.displayName = 'DatePickerModal';
DatePickerModal.displayName = 'DatePickerModal';

export default DatePickerModal;
