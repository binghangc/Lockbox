import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function ItineraryDayNavigator({
  tripDays,
  currentIndex,
  onBack,
  onNext,
  onSelectDay,
}: {
  tripDays: string[];
  currentIndex: number;
  onBack: () => void;
  onNext: () => void;
  onSelectDay: (index: number) => void;
}) {
  return (
    <>
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity onPress={onBack} disabled={currentIndex === 0}>
          <Text className="text-white text-lg">{'<'} Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          disabled={currentIndex === tripDays.length - 1}
        >
          <Text className="text-white text-lg">Next {'>'}</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center space-x-6 mt-6">
        {tripDays.map((date, index) => (
          <TouchableOpacity key={date} onPress={() => onSelectDay(index)}>
            <View
              className={`w-2.5 h-2.5 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-neutral-500'
              }`}
            />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
