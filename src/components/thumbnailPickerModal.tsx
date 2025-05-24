import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState } from 'react';
import { Text, TouchableOpacity, Image, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';

export type ThumbnailPickerModalRef = Modalize;


const ThumbnailPickerModal = forwardRef<Modalize, {
  onSelect?: (url: string) => void;
}>(function ThumbnailPickerModal(props, ref) {
  const { onSelect } = props;

  const modalRef = useRef<Modalize>(null);

  useImperativeHandle(ref, () => modalRef.current!);

  const [thumbnails, setThumbnails] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/thumbnails`);
        if (!res.ok) throw new Error('Failed to fetch thumbnails');
        const data = await res.json();
        setThumbnails(data);
      } catch (err) {
        console.error('Error loading thumbnails:', err);
      }
    };

    fetchThumbnails();
  }, []);

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      handleStyle={{ backgroundColor: '#ccc' }}
      handlePosition="inside"
      modalStyle={{ backgroundColor: 'transparent', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      modalTopOffset={45}
      customRenderer={(scrollViewProps: any) => (
        <BlurView
          intensity={60}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <ScrollView {...scrollViewProps} showsVerticalScrollIndicator={false}>
            <View style={{ paddingVertical: 16, paddingHorizontal: 8 }}>
              <Text className="text-white text-xl font-bold text-center mb-3 mt-4">Thumbnails</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 4 }}>
              {thumbnails.map((item) => (
                <TouchableOpacity
                  key={item.url}
                  onPress={() => {
                    onSelect?.(item.url);
                    modalRef.current?.close();
                  }}
                  style={{
                    width: '49.5%',
                    aspectRatio: 1,
                    marginBottom: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    source={{ uri: item.url }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  modalRef.current?.close();
                }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 5,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 12,
                }}
              >
                <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BlurView>
      )}
    />
  );
});

export default ThumbnailPickerModal;
