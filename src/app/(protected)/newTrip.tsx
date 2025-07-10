/* eslint-disable no-param-reassign */
import dayjs from 'dayjs';
import { VideoView, useVideoPlayer } from 'expo-video';
import videoBackgrounds from '@/constants/videoBackgrounds';
import {
  useTripTheme,
  useSetTripTheme,
  TripThemeProvider,
} from '@/context/TripThemeProvider';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Foundation } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState, useRef } from 'react';
import DatePickerModal, {
  DatePickerModalRef,
} from '@/components/newTrip/datePickerModal';
import LocationPickerModal, {
  LocationPickerModalRef,
} from '@/components/newTrip/locationPickerModal';
import ThumbnailPickerModal, {
  ThumbnailPickerModalRef,
} from '@/components/newTrip/thumbnailPickerModal';
import { useUser } from '@/context/UserContext';
import CreateTripHeader from '@/components/newTrip/createTripHeader';

import TripStylePillbar from '@/components/newTrip/tripStylePillbar';

function NewTrip({
  selectedVideoKey,
  setSelectedVideoKey,
}: {
  selectedVideoKey: string | null;
  setSelectedVideoKey: (key: string) => void;
}) {
  const router = useRouter();
  const { token } = useUser();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const modalRef = useRef<DatePickerModalRef>(null);
  const locationModalRef = useRef<LocationPickerModalRef>(null);
  const thumbnailModalRef = useRef<ThumbnailPickerModalRef>(null);
  const insets = useSafeAreaInsets();

  const [tripTitle, setTripTitle] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string;
    flag: string;
  } | null>(null);

  const [isDescriptionFocused, setDescriptionFocused] = useState(false);

  // Video background logic
  const selectedVideo = selectedVideoKey
    ? videoBackgrounds[selectedVideoKey]
    : null;
  const videoSource = selectedVideo?.uri;

  const player = useVideoPlayer(videoSource ?? '', (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.play();
  });

  const theme = useTripTheme();
  const setThemeByVideoKey = useSetTripTheme();
  const handleSelectBackground = (key: string) => {
    setSelectedVideoKey(key);
    setThemeByVideoKey(key);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const openDatePicker = () => modalRef.current?.open();

  const openLocationPicker = () => locationModalRef.current?.open();

  const openThumbnailPicker = () => thumbnailModalRef.current?.open();

  const handleDateConfirm = (range: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const handleCountrySelect = (country: { name: string; flag: string }) => {
    setSelectedCountry(country);
    locationModalRef.current?.close();
  };

  const handleSaveTrip = async () => {
    if (
      !tripTitle ||
      !tripDescription ||
      !startDate ||
      !endDate ||
      !selectedCountry
    ) {
      console.warn('Missing required fields');
      return;
    }

    if (!token) {
      console.error('No token in context');
      return;
    }

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: tripTitle,
          description: tripDescription,
          start_date: startDate,
          end_date: endDate,
          country: selectedCountry.name,
          thumbnail_url:
            thumbnailUrl ||
            'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/wine-hand.avif',
          tags: selectedTags,
          video_background: selectedVideoKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Error saving trip:', data.error);
        return;
      }

      const tripId = data.data[0]?.id;

      if (data.needsImmediateItinerary) {
        Alert.alert(
          'Start setting your itinerary',
          'Since your trip starts today, your itinerary must be created now.',
          [
            {
              text: 'OK',
              onPress: () => router.replace(`/trips/${tripId}/itinerary`),
            },
          ],
        );
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  };

  return (
    <>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <CreateTripHeader
          onCancel={() => router.back()}
          onSave={handleSaveTrip}
          title="New Trip"
        />

        {/* Content with padding top for header */}
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 75,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 90,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled
        >
          {/* Trip Title */}
          <BlurView
            intensity={40}
            tint={theme.blurTint as 'light' | 'dark' | 'default'}
            className="rounded-md border mb-6 px-4 py-3 overflow-hidden"
            style={{ borderColor: theme.secondaryOutline }}
          >
            <TextInput
              value={tripTitle}
              onChangeText={setTripTitle}
              placeholder="Untitled Trip"
              placeholderTextColor={theme.secondaryText}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                color: theme.primaryText,
                fontSize: 32,
                fontWeight: '800',
                textAlign: 'center',
              }}
            />
          </BlurView>

          <View className="w-full aspect-square overflow-hidden relative mb-6">
            <Image
              source={
                thumbnailUrl
                  ? { uri: thumbnailUrl }
                  : {
                      uri: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/wine-hand.avif',
                    }
              }
              resizeMode="cover"
              className="w-full h-full"
            />
            <BlurView
              intensity={50}
              tint={theme.blurTint as 'light' | 'dark' | 'default'}
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                borderRadius: 100,
                width: 36,
                height: 36,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.secondaryOutline,
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                onPress={openThumbnailPicker}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Foundation name="pencil" size={20} color={theme.primaryText} />
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* Date Button */}
          <TouchableOpacity activeOpacity={0.8} onPress={openDatePicker}>
            <BlurView
              intensity={40}
              tint={theme.blurTint as 'light' | 'dark' | 'default'}
              className="rounded-md border mb-4 px-4 py-5 overflow-hidden"
              style={{ borderColor: theme.secondaryOutline }}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  numberOfLines={2}
                  style={{
                    textAlign: 'left',
                    color: theme.primaryText,
                    fontSize: 20,
                    fontWeight: '600',
                  }}
                >
                  {startDate && endDate
                    ? `${dayjs(startDate).format('ddd, MMM D')} -\n${dayjs(endDate).format('ddd, MMM D')}`
                    : 'Select dates'}
                </Text>
                <AntDesign
                  name="caretdown"
                  size={14}
                  color={theme.primaryText}
                />
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Location Button */}
          <TouchableOpacity activeOpacity={0.8} onPress={openLocationPicker}>
            <BlurView
              intensity={40}
              tint={theme.blurTint as 'light' | 'dark' | 'default'}
              className="rounded-md border mb-4 px-4 py-2 overflow-hidden"
              style={{ borderColor: theme.secondaryOutline }}
            >
              <View className="flex-row items-center space-x-2">
                <FontAwesome6
                  name="location-dot"
                  size={14}
                  color={theme.primaryText}
                />
                <Text
                  style={{
                    color: theme.primaryText,
                    fontSize: 18,
                    marginLeft: 12,
                  }}
                >
                  {selectedCountry ? `${selectedCountry.name}` : 'Location'}
                </Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Tags Button */}
          <View className="-mx-4 mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            >
              {[
                'Friends',
                'Family',
                'Grad',
                'Day Trip',
                'Nature',
                'City',
                'Bachelorette',
                'Honeymoon',
                'Road Trip',
                'Camping',
                'Solo',
              ].map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <BlurView
                    key={tag}
                    intensity={40}
                    tint={theme.blurTint as 'light' | 'dark' | 'default'}
                    className="rounded-full overflow-hidden border"
                    style={{
                      borderColor: isSelected
                        ? theme.primaryOutline
                        : theme.secondaryOutline,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => toggleTag(tag)}
                      className="px-4 py-1"
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? theme.primaryText
                            : theme.secondaryText,
                          fontSize: 16,
                          fontWeight: '400',
                        }}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  </BlurView>
                );
              })}
            </ScrollView>
          </View>

          {/* Description Input */}
          <BlurView
            intensity={40}
            tint={
              isDescriptionFocused
                ? (theme.blurrierTint as 'light' | 'dark' | 'default')
                : (theme.blurTint as 'light' | 'dark' | 'default')
            }
            className="rounded-md border mb-6 px-4 py-4 overflow-hidden"
            style={{ borderColor: theme.secondaryOutline }}
          >
            <TextInput
              value={tripDescription}
              onChangeText={setTripDescription}
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
              placeholder="Drop the deets on your trip"
              placeholderTextColor={theme.mutedText}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                minHeight: 100,
                textAlignVertical: 'top',
                color: theme.primaryText,
                fontSize: 18,
              }}
            />
          </BlurView>
        </ScrollView>

        <DatePickerModal ref={modalRef} onConfirm={handleDateConfirm} />
        <LocationPickerModal
          ref={locationModalRef}
          onSelectCountry={handleCountrySelect}
        />
        <ThumbnailPickerModal
          ref={thumbnailModalRef}
          onSelect={(url) => setThumbnailUrl(url)}
        />
        <TripStylePillbar
          selectedBackgroundKey={selectedVideoKey}
          onSelectBackground={handleSelectBackground}
          onPressTheme={() => {}}
          onPressEffect={() => {}}
        />
      </View>
    </>
  );
}

export default function NewTripWrapper() {
  const [selectedVideoKey, setSelectedVideoKey] = useState<string>('moonlight');

  return (
    <TripThemeProvider videoKey={selectedVideoKey}>
      <NewTrip
        selectedVideoKey={selectedVideoKey}
        setSelectedVideoKey={setSelectedVideoKey}
      />
    </TripThemeProvider>
  );
}
