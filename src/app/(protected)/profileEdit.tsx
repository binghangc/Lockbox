import {
  Alert,
  Text,
  View,
  Button,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

// Components
import { useUser } from '@/components/UserContext';
import FormInput from '@/components/formInput';
import EditActionRow from '@/components/editActionRow';
import { supabase } from '../../../lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser, loading } = useUser();

  // State variables for editing name/bio
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  const [tempBio, setTempBio] = useState(user?.bio || '');

  // State variable for uploading image
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setTempName(user.name || '');
      setTempBio(user.bio || '');
    }
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('User logged out successfully');
      await AsyncStorage.removeItem('access_token');
      setUser(null);
      router.replace('/(auth)/');
    }
  };

  const handleUpdateProfile = async (field: 'name' | 'bio', value: string) => {
    if (tempName === user?.name && tempBio === user?.bio) {
      setIsEditingName(false);
      setIsEditingBio(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/edit`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user?.id,
            field,
            value,
          }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Error', result.error || 'Failed to update profile');
        return;
      }
      setUser({
        id: user!.id,
        username: user!.username,
        name: field === 'name' ? value : user!.name,
        bio: field === 'bio' ? value : user!.bio,
        avatar_url: user!.avatar_url,
      });
      Alert.alert(
        'Upload Successful',
        'Your profile information has been updated!',
      );
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
      console.error(err);
    }
  };

  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // API SHIFTS IN THE FUTURE MAY CHANGE THIS
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (result.canceled) return;

      const image = result.assets[0];
      const { uri } = image;
      const name = uri.split('/').pop() || 'avatar.jpg';

      const file = {
        uri,
        type: 'image/jpeg',
        name,
      };

      const formData = new FormData();
      formData.append('avatar', file as unknown as Blob);
      if (!user) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }
      formData.append('user_id', user.id);

      setUploading(true);

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/upload-avatar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      const clone = res.clone();

      let data;
      try {
        data = await res.json(); // attempt normal parse
      } catch {
        const raw = await clone.text(); // fallback to raw response (HTML, error, etc)
        console.error('👀 RAW RESPONSE:', raw); // this will reveal the actual error
        Alert.alert('Upload failed', 'Server did not return valid JSON');
        setUploading(false);
        return;
      }
      setUploading(false);

      if (!res.ok) {
        Alert.alert('Upload failed', data.error || 'Try again');
        return;
      }

      // Update user context
      setUser({ ...user, avatar_url: data.avatar_url });
      Alert.alert(
        'Upload Successful',
        'Your profile picture has been updated!',
      );
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploading(false);
      Alert.alert('Error', 'Something went wrong while uploading');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white text-lg">Please log in again.</Text>
        <Button title="Go to Login" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
      {user.avatar_url ? (
        <TouchableOpacity onPress={handleUploadImage} className="relative mb-4">
          <Image
            source={{
              uri: uploading
                ? 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif'
                : user.avatar_url || 'https://via.placeholder.com/150',
            }}
            className="w-32 h-32 rounded-full border border-gray-300"
          />
          <View className="absolute bottom-2 right-2 bg-neutral-800 p-1 rounded-full">
            <Feather name="edit-2" size={16} color="#aaa" />
          </View>
        </TouchableOpacity>
      ) : (
        <View className="w-32 h-32 rounded-full bg-gray-700 mb-4" />
      )}
      <Text className="text-gray-400 text-lg mb-2">
        @{user.username || 'Username not set'}
      </Text>

      {/* Name */}
      <View className="w-full mb-3">
        {isEditingName ? (
          <View>
            <FormInput
              label="Name"
              value={tempName}
              onChangeText={setTempName}
              onEndEditing={() => {
                if (tempName !== user?.name) {
                  handleUpdateProfile('name', tempName);
                }
                setIsEditingName(false);
              }}
              placeholder="Enter name"
            />
            <EditActionRow
              onCancel={() => setIsEditingName(false)}
              onSave={async () => {
                await handleUpdateProfile('name', tempName);
                setIsEditingName(false);
              }}
            />
          </View>
        ) : (
          <View className="w-full mb-4">
            <View className="flex-row items-center justify-center space-x-2">
              <Text className="text-white text-2xl">
                {user.name || 'Name not set'}
              </Text>
              <TouchableOpacity onPress={() => setIsEditingName(true)}>
                <Feather name="edit-2" size={18} color="#aaa" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bio */}
      <View className="w-full mb-6">
        {isEditingBio ? (
          <View>
            <FormInput
              label="Bio"
              value={tempBio}
              onChangeText={setTempBio}
              onEndEditing={() => {
                if (tempBio !== user?.bio) {
                  handleUpdateProfile('bio', tempBio);
                }
                setIsEditingBio(false);
              }}
              placeholder="Enter bio"
              multiline
            />
            <EditActionRow
              onCancel={() => setIsEditingBio(false)}
              onSave={async () => {
                await handleUpdateProfile('bio', tempBio);
                setIsEditingBio(false);
              }}
            />
          </View>
        ) : (
          <View className="w-full mb-4">
            <View className="flex-row items-center justify-center space-x-10">
              <Text className="text-white text-l">
                {user.bio || 'Bio not set'}
              </Text>
              <TouchableOpacity onPress={() => setIsEditingBio(true)}>
                <Feather name="edit-2" size={18} color="#aaa" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
