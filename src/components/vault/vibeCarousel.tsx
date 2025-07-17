/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { FlatList, View, Dimensions } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTripTheme } from '@/context/TripThemeProvider';
import VibeCard from './vibeCard';

type Vibe = {
  id: string;
  prompt: string;
  date: string;
  thumbnail_url?: string;
};

type VibeCarouselProps = {
  tripId: string;
  selectedVibeId: string | null;
  onSelect: (id: string) => void;
};

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 200;
const CARD_MARGIN = 24;
const ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN;

export default function VibeCarousel({
  tripId,
  selectedVibeId,
  onSelect,
}: VibeCarouselProps) {
  const theme = useTripTheme();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Create cycling data by repeating the vibes array multiple times
  const getCyclingData = (originalVibes: Vibe[]) => {
    if (originalVibes.length === 0) return [];
    const cycles = 5; // Number of cycles
    const cyclingData = [];
    for (let i = 0; i < cycles; i++) {
      cyclingData.push(...originalVibes);
    }
    return cyclingData;
  };

  const cyclingVibes = getCyclingData(vibes);
  const middleIndex = Math.floor(cyclingVibes.length / 2);

  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/vibechecks/trips/${tripId}/vibechecks`,
          {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem('access_token')}`,
            },
          },
        );
        const raw = await res.text();
        console.log('Raw vibechecks response:', raw);
        let json;
        try {
          json = JSON.parse(raw);
        } catch (err) {
          console.error('JSON parse failed:', err);
          return;
        }
        if (res.ok) {
          setVibes(
            json.vibechecks.map(
              (v: { id: string; vibecheck: string; date: string }) => ({
                id: v.id,
                prompt: v.vibecheck,
                date: v.date,
              }),
            ),
          );
        } else {
          console.error('Failed to fetch vibechecks:', json.error);
        }
      } catch (err) {
        console.error('Error fetching vibechecks:', err);
      }
    };

    fetchVibes();
  }, [tripId]);

  useEffect(() => {
    // Auto-select the centered item
    if (cyclingVibes.length > 0) {
      const centeredVibe = cyclingVibes[currentIndex];
      if (centeredVibe) {
        onSelect(centeredVibe.id);
      }
    }
  }, [currentIndex, cyclingVibes, onSelect]);

  useEffect(() => {
    // Start at the middle of the cycling array
    if (cyclingVibes.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: middleIndex,
          animated: false,
        });
        setCurrentIndex(middleIndex);
      }, 100);
    }
  }, [cyclingVibes.length, middleIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / ITEM_WIDTH);
    setScrollX(contentOffset);
    setCurrentIndex(index);
    setIsScrolling(true);
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / ITEM_WIDTH);

    setCurrentIndex(index);
    setIsScrolling(false);

    // Handle cycling - if we're near the beginning or end, jump to equivalent position
    if (vibes.length > 0) {
      const originalLength = vibes.length;
      if (index < originalLength) {
        // Near beginning, jump to equivalent position in middle
        const newIndex = index + originalLength * 2;
        flatListRef.current?.scrollToIndex({
          index: newIndex,
          animated: false,
        });
        setCurrentIndex(newIndex);
      } else if (index >= cyclingVibes.length - originalLength) {
        // Near end, jump to equivalent position in middle
        const newIndex = index - originalLength * 2;
        flatListRef.current?.scrollToIndex({
          index: newIndex,
          animated: false,
        });
        setCurrentIndex(newIndex);
      }
    }
  };

  const getItemLayout = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: ArrayLike<any> | null | undefined,
    index: number,
  ) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  // If only one vibe, show it centered without carousel
  if (vibes.length === 1) {
    return (
      <View
        style={{
          paddingVertical: 20,
          backgroundColor: 'transparent',
          alignItems: 'center',
        }}
      >
        <VibeCard
          vibe={vibes[0]}
          isSelected
          index={0}
          scrollX={0}
          itemWidth={ITEM_WIDTH}
          isScrolling={false}
          onPress={() => onSelect(vibes[0].id)}
        />
      </View>
    );
  }

  // If no vibes, return empty view
  if (vibes.length === 0) {
    return (
      <View
        style={{
          paddingVertical: 20,
          backgroundColor: 'transparent',
        }}
      />
    );
  }

  return (
    <View
      style={{
        paddingVertical: 20,
        backgroundColor: 'transparent',
        overflow: 'visible',
      }}
    >
      <FlatList
        ref={flatListRef}
        horizontal
        data={cyclingVibes}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsHorizontalScrollIndicator={false}
        style={{ overflow: 'visible' }}
        contentContainerStyle={{
          paddingLeft: (screenWidth - CARD_WIDTH) / 2 - 16,
          paddingRight: (screenWidth - CARD_WIDTH) / 2 + 16,
        }}
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <VibeCard
            vibe={item}
            isSelected={index === currentIndex}
            scrollX={scrollX}
            index={index}
            itemWidth={ITEM_WIDTH}
            isScrolling={isScrolling}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
              });
            }}
          />
        )}
      />
    </View>
  );
}
