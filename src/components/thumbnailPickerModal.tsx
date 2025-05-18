import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
      flatListProps={{
        data: thumbnails,
        keyExtractor: (item) => item.url,
        showsVerticalScrollIndicator: false,
        numColumns: 2,
        columnWrapperStyle: {
          justifyContent: 'space-between',
          paddingHorizontal: 0,
          marginBottom: 4,
        },
        renderItem: ({ item }) => (
          <TouchableOpacity
            onPress={() => {
              onSelect?.(item.url);
              modalRef.current?.close();
            }}
            style={{
              width: '49.5%',
              aspectRatio: 1,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: item.url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ),
        ListHeaderComponent: () => (
          <BlurView
            intensity={60}
            tint="dark"
            style={{
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            <Text className="text-white text-xl font-bold text-center mb-6">Thumbnails</Text>
          </BlurView>
        ),
        ListFooterComponent: () => (
          <BlurView
            intensity={60}
            tint="dark"
            style={{
              paddingVertical: 24,
              paddingHorizontal: 24,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
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
          </BlurView>
        ),
      }}
    />
  );
});

export default ThumbnailPickerModal;
