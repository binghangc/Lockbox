import dayjs from 'dayjs';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import placeholderThumbnail from '../../../assets/placeholder-thumbnail.png';
import { useState, useRef } from 'react';
import DatePickerModal, { DatePickerModalRef } from '@/components/datePickerModal';
import LocationPickerModal, { LocationPickerModalRef } from '@/components/locationPickerModal';

export default function NewTrip() {
  
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const modalRef = useRef<DatePickerModalRef>(null);
  const locationModalRef = useRef<LocationPickerModalRef>(null);
  const insets = useSafeAreaInsets();

  const [tripTitle, setTripTitle] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; flag: string } | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const openDatePicker = () => modalRef.current?.open();
  const closeDatePicker = () => modalRef.current?.close();

  const openLocationPicker = () => locationModalRef.current?.open();
  const closeLocationPicker = () => locationModalRef.current?.close();

  const handleDateConfirm = (range: { startDate: string | null; endDate: string | null }) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const handleCountrySelect = (country: { name: string; flag: string }) => {
    setSelectedCountry(country);
    locationModalRef.current?.close();
  };


  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Blur */}
      <BlurView intensity={60}  className="absolute top-0 left-0 right-0 z-10">
        <SafeAreaView style={{ paddingTop: insets.top }}>
          <View className="flex-row justify-between items-center px-4 py-2 mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-base font-semibold text-white">Cancel</Text>
            </TouchableOpacity>

            <Text className="text-xl font-bold text-white">New Trip</Text>

            <TouchableOpacity onPress={() => {}}>
              <Text className="text-base font-semibold text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Content with padding top for header */}
      <ScrollView
        className="flex-1 pt-36 px-4 bg-black"
        showsVerticalScrollIndicator={false}
      >
        {/* Trip Title */}
        <BlurView intensity={40} tint="light" className="rounded-md border border-white/20 mb-6 px-4 py-3 overflow-hidden">
          <TextInput
            value={tripTitle}
            onChangeText={setTripTitle}
            placeholder="Untitled Trip"
            placeholderTextColor="white"
            className="text-4xl font-extrabold text-center text-white"
          />
        </BlurView>

        <View className="w-full aspect-square overflow-hidden relative mb-6">
          <Image
            source={placeholderThumbnail}
            resizeMode="cover"
            className="w-full h-full"
          />
          <TouchableOpacity className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full">
          <MaterialIcons name="mode-edit" size={19} color="white" />
          </TouchableOpacity>
        </View>


        {/* Date Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={openDatePicker}>
          <BlurView intensity={40} tint="light" className="rounded-md border border-white/20 mb-4 px-4 py-5 overflow-hidden">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-2xl font-semibold" numberOfLines={2} style={{ textAlign: 'left' }}>
                {startDate && endDate
                  ? `${dayjs(startDate).format('ddd, MMM D')} -\n${dayjs(endDate).format('ddd, MMM D')}`
                  : 'Select dates'}
              </Text>
              <AntDesign name="caretdown" size={14} color="white" />
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Location Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={openLocationPicker}>
          <BlurView intensity={40} tint="light" className="rounded-md border border-white/20 mb-4 px-4 py-2 overflow-hidden">
            <View className="flex-row items-center space-x-2">
              <FontAwesome6 name="location-dot" size={14} color="white" />
              <Text className="text-white text-xl ml-3">
                {selectedCountry ? `${selectedCountry.name}` : 'Location'}
              </Text>
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Tags Button */}
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
        >
          {[
            'Honeymoon',
            'Road Trip',
            'Grad',
            'Day Trip',
            'Nature',
            'City',
            'Bachelorette',
            'Friends',
            'Family',
            'Camping',
          ].map((tag) => (
            <TouchableOpacity
              key={tag}
              className="px-4 py-2 rounded-full border border-white/30 bg-white/10"
            >
              <Text className="text-white text-sm font-medium">{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        {/* Description Input */}
        <BlurView intensity={40} tint="light" className="rounded-md border border-white/20 mb-6 px-4 py-4 overflow-hidden">
          <TextInput
            value={tripDescription}
            onChangeText={setTripDescription}
            placeholder="Drop the deets on your trip"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            multiline
            style={{ minHeight: 100, textAlignVertical: 'top' }}
            className="text-xl text-white text-start"
          />
        </BlurView>

      </ScrollView>

      <DatePickerModal ref={modalRef} onConfirm={handleDateConfirm} />
      <LocationPickerModal ref={locationModalRef} onSelectCountry={handleCountrySelect} />
      
    </View>
  );
}