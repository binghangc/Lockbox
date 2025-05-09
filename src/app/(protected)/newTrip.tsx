import { View, Text, TextInput, Pressable, Image, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function NewTripScreen() {
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [thumbnailModalVisible, setThumbnailModalVisible] = useState(false);

  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);
      setThumbnailModalVisible(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-pink-100 to-purple-100">
              <BlurView
          intensity={80} 
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
        <SafeAreaView className="flex-row justify-between items-center w-full">
          <Pressable onPress={() => router.replace('/(tabs)')}>
            <Text className="text-black text-base font-medium">Cancel</Text>
          </Pressable>
          <Text className="text-black text-xl font-bold">New Trip</Text>
          <Pressable>
            <Text className="text-blue-500 font-semibold">Save</Text>
          </Pressable>
        </SafeAreaView>
      </BlurView>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TextInput
          className="text-3xl font-bold text-black my-2"
          placeholder="Untitled Trip"
          value={title}
          onChangeText={setTitle}
        />

        <View className="flex-row justify-around my-3">
          {['Classic', 'Eclectic', 'Fancy', 'Simple'].map((style) => (
            <Pressable
              key={style}
              className="px-3 py-1 border border-black/30 rounded-full"
            >
              <Text className="text-black">{style}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setThumbnailModalVisible(true)} className="my-4">
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              className="w-full aspect-square rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full aspect-square bg-gray-200 rounded-lg justify-center items-center">
              <Text className="text-gray-500">Tap to select thumbnail</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          className="border border-black/30 p-3 rounded-lg my-2 bg-white"
          onPress={() => setCalendarModalVisible(true)}
        >
          <Text className="text-black">Set Start Date</Text>
        </Pressable>

        <Pressable
          className="border border-black/30 p-3 rounded-lg my-2 bg-white"
          onPress={() => setCalendarModalVisible(true)}
        >
          <Text className="text-black">Set End Date</Text>
        </Pressable>

        <Pressable
          className="border border-black/30 p-3 rounded-lg my-2 bg-white"
          onPress={() => setLocationModalVisible(true)}
        >
          <Text className="text-black">Set Location</Text>
        </Pressable>
      </ScrollView>

      {/* Thumbnail Modal */}
      <Modal visible={thumbnailModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-lg p-6">
            <Text className="text-lg font-semibold mb-4">Choose a Thumbnail</Text>
            {/* Pre-designed image options would go here */}
            <Pressable
              onPress={pickImage}
              className="bg-blue-500 py-3 rounded-lg mt-2 items-center"
            >
              <Text className="text-white font-medium">Pick from gallery</Text>
            </Pressable>
            <Pressable onPress={() => setThumbnailModalVisible(false)} className="mt-3 items-center">
              <Text className="text-blue-500">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal visible={locationModalVisible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-white">
          <Text>Location Picker Placeholder</Text>
          <Pressable onPress={() => setLocationModalVisible(false)}>
            <Text className="text-blue-500 mt-4">Close</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal visible={calendarModalVisible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-white">
          <Text>Calendar Picker Placeholder</Text>
          <Pressable onPress={() => setCalendarModalVisible(false)}>
            <Text className="text-blue-500 mt-4">Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}