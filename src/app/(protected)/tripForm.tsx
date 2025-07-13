import dayjs from 'dayjs';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
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
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Foundation } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState, useRef, useEffect } from 'react';
import useTrips, { markTripDirty } from '@/hooks/useTrips';
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
import CreateTripHeader from '@/components/shared/tripActionHeader';

import TripStylePillbar from '@/components/newTrip/tripStylePillbar';

function TripForm({
  selectedVideoKey,
  setSelectedVideoKey,
  mode,
  tripId,
}: {
  selectedVideoKey: string | null;
  setSelectedVideoKey: (key: string) => void;
  mode: 'create' | 'edit';
  tripId?: string;
}) {
  const router = useRouter();
  const { user, authenticatedFetch } = useUser();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const modalRef = useRef<DatePickerModalRef>(null);
  const locationModalRef = useRef<LocationPickerModalRef>(null);
  const thumbnailModalRef = useRef<ThumbnailPickerModalRef>(null);
  const insets = useSafeAreaInsets();

  const [tripTitle, setTripTitle] = useState('Untitled Trip');
  const [tripDescription, setTripDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string;
    flag: string;
  } | null>(null);

  const [isDescriptionFocused, setDescriptionFocused] = useState(false);
  const [isTitleFocused, setTitleFocused] = useState(false);

  const [selectedEffectKey, setSelectedEffectKey] = useState<string | null>(
    null,
  );

  const theme = useTripTheme();
  const setThemeByVideoKey = useSetTripTheme();

  const scrollViewRef = useRef<ScrollView>(null);

  // Prefill fields in edit mode
  const { trip } = useTrips(tripId);
  useEffect(() => {
    if (mode === 'edit' && tripId && trip && trip.id === tripId) {
      setTripTitle(trip.title || '');
      setTripDescription(trip.description || '');
      setStartDate(trip.start_date || null);
      setEndDate(trip.end_date || null);
      setSelectedCountry(
        trip.country ? { name: trip.country, flag: '' } : null,
      );
      setThumbnailUrl(trip.thumbnail_url || '');
      setSelectedTags(trip.tags || []);

      // Update both video key and theme when trip loads
      const videoKey = trip.video_background || 'moonlight';
      setSelectedVideoKey(videoKey);
      setThemeByVideoKey(videoKey); // This was missing!

      setSelectedEffectKey(trip.effects || null);
    }
  }, [mode, tripId, trip, setSelectedVideoKey, setThemeByVideoKey]);

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

    if (!user || !authenticatedFetch) {
      console.error('Authentication required');
      return;
    }

    try {
      const endpoint =
        mode === 'edit' && tripId
          ? `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/edit`
          : `${process.env.EXPO_PUBLIC_API_URL}/trips`;

      const res = await authenticatedFetch(endpoint, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          effects: selectedEffectKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Error saving trip:', data.error);
        return;
      }

      if (mode === 'edit' && tripId) {
        markTripDirty(tripId);
        router.back();
        setTimeout(() => {
          router.setParams({ refresh: Date.now().toString() });
        }, 100);
      } else {
        // For create mode, get the new trip ID and navigate
        const tripIdResult = data.data[0]?.id;

        if (data.needsImmediateItinerary) {
          Alert.alert(
            'Start setting your itinerary',
            'Since your trip starts today, your itinerary must be created now.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.replace(
                    `/(protected)/trips/${tripIdResult}/itinerary`,
                  ),
              },
            ],
          );
        } else {
          router.replace(`/(protected)/trips/${tripIdResult}`);
        }
      }
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  };

  // Description BlurView tint logic
  let descriptionTint: 'light' | 'dark' | 'default';
  if (Platform.OS === 'android' && isDescriptionFocused) {
    descriptionTint = 'default';
  } else if (isDescriptionFocused) {
    descriptionTint = theme.blurrierTint as 'light' | 'dark' | 'default';
  } else {
    descriptionTint = theme.blurTint as 'light' | 'dark' | 'default';
  }

  return (
    <>
      <TripVisualBackground
        videoKey={selectedVideoKey}
        effectKey={selectedEffectKey}
      />
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <CreateTripHeader
          onCancel={() => router.back()}
          onSave={handleSaveTrip}
          title={mode === 'edit' ? 'Edit Trip' : 'New Trip'}
        />
        {/* Content with padding top for header */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              ref={scrollViewRef}
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
                tint={(() => {
                  if (Platform.OS === 'android' && isTitleFocused) {
                    return 'default';
                  }
                  if (isTitleFocused) {
                    return theme.blurrierTint as 'light' | 'dark' | 'default';
                  }
                  return theme.blurTint as 'light' | 'dark' | 'default';
                })()}
                className="rounded-md border mb-6 px-4 py-3 overflow-hidden"
                style={{
                  borderColor: theme.secondaryOutline,
                  backgroundColor:
                    Platform.OS === 'android' && isTitleFocused
                      ? `${theme.background}88`
                      : undefined,
                }}
              >
                <TextInput
                  value={tripTitle}
                  onChangeText={setTripTitle}
                  placeholder="Name your trip"
                  placeholderTextColor={`${theme.mutedText}AA`}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  selectTextOnFocus
                  selectionColor={theme.highlight}
                  maxLength={40}
                  style={{
                    color: theme.primaryText,
                    fontSize: 32,
                    fontWeight: '800',
                    textAlign: 'center',
                    fontFamily: 'RocGroteskWideMedium',
                  }}
                  // Ensures placeholder font style (for iOS/Android visual parity)
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
                    <Foundation
                      name="pencil"
                      size={20}
                      color={theme.primaryText}
                    />
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openLocationPicker}
              >
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
                    'Backpacking',
                    'Adventure',
                  ].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <BlurView
                        key={tag}
                        intensity={40}
                        tint={(() => {
                          if (Platform.OS === 'android' && isSelected) {
                            return 'default';
                          }
                          if (isSelected) {
                            return theme.blurrierTint as
                              | 'light'
                              | 'dark'
                              | 'default';
                          }
                          return theme.blurTint as 'light' | 'dark' | 'default';
                        })()}
                        className="rounded-full overflow-hidden border"
                        style={{
                          borderColor: isSelected
                            ? theme.primaryOutline
                            : theme.secondaryOutline,
                          backgroundColor:
                            Platform.OS === 'android' && isSelected
                              ? `${theme.background}66`
                              : undefined,
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
                tint={descriptionTint}
                className="rounded-md border mb-6 px-4 py-4 overflow-hidden"
                style={{
                  borderColor: theme.secondaryOutline,
                  backgroundColor:
                    Platform.OS === 'android' && isDescriptionFocused
                      ? `${theme.background}88`
                      : undefined,
                }}
              >
                <TextInput
                  value={tripDescription}
                  onChangeText={setTripDescription}
                  onFocus={() => {
                    setDescriptionFocused(true);
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                  onBlur={() => setDescriptionFocused(false)}
                  placeholder="Drop the deets on your trip"
                  placeholderTextColor={theme.mutedText}
                  multiline
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  selectionColor={theme.highlight}
                  style={{
                    minHeight: 100,
                    textAlignVertical: 'top',
                    color: theme.primaryText,
                    fontSize: 18,
                    textAlign: 'left',
                  }}
                />
              </BlurView>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

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
          selectedEffectKey={selectedEffectKey}
          onSelectEffect={setSelectedEffectKey}
          onPressTheme={() => {}}
          onPressEffect={() => {}}
        />
      </View>
    </>
  );
}

export default function TripFormWrapper() {
  const { mode, tripId } = useLocalSearchParams();
  const [selectedVideoKey, setSelectedVideoKey] = useState<string>('moonlight');

  // In edit mode, we need to wait for the trip data to load before setting the theme
  const { trip } = useTrips(typeof tripId === 'string' ? tripId : undefined);

  // Initialize with the trip's video background if in edit mode
  const initialVideoKey =
    mode === 'edit' && trip?.video_background
      ? trip.video_background
      : selectedVideoKey;

  return (
    <TripThemeProvider videoKey={initialVideoKey}>
      <TripForm
        selectedVideoKey={selectedVideoKey}
        setSelectedVideoKey={setSelectedVideoKey}
        mode={mode === 'edit' ? 'edit' : 'create'}
        tripId={typeof tripId === 'string' ? tripId : undefined}
      />
    </TripThemeProvider>
  );
}
