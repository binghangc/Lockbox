import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const CLUSTER_SIZE = 7;

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
  const currentCluster = Math.floor(currentIndex / CLUSTER_SIZE);
  const clusterStart = currentCluster * CLUSTER_SIZE;
  const clusterEnd = Math.min(clusterStart + CLUSTER_SIZE, tripDays.length);
  const clusterDays = tripDays.slice(clusterStart, clusterEnd);

  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < tripDays.length - 1;

  return (
    <>
      {/* Prev / Next Arrows */}
      <View className="flex-row justify-between mt-4 px-4">
        <TouchableOpacity onPress={onBack} disabled={!canGoBack}>
          <Text
            className={`text-lg ${
              canGoBack ? 'text-white' : 'text-neutral-500'
            }`}
          >
            {'<'} Prev
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext} disabled={!canGoNext}>
          <Text
            className={`text-lg ${
              canGoNext ? 'text-white' : 'text-neutral-500'
            }`}
          >
            Next {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dot Indicators (Paginated) */}
      <View className="flex-row justify-center space-x-4 mt-6">
        {clusterStart > 0 && (
          <View className="w-2.5 h-2.5 rounded-full bg-neutral-400 opacity-50" />
        )}
        {clusterDays.map((_, i) => {
          const actualIndex = clusterStart + i;
          const isActive = actualIndex === currentIndex;
          return (
            <TouchableOpacity
              key={actualIndex}
              onPress={() => onSelectDay(actualIndex)}
            >
              <View
                className={`w-2.5 h-2.5 rounded-full ${
                  isActive ? 'bg-white' : 'bg-neutral-500'
                }`}
              />
            </TouchableOpacity>
          );
        })}
        {clusterEnd < tripDays.length && (
          <View className="w-2.5 h-2.5 rounded-full bg-neutral-400 opacity-70" />
        )}
      </View>
    </>
  );
}
