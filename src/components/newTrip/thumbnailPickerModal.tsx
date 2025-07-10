/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
} from 'react';
import { Text, TouchableOpacity, Image, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Modalize } from 'react-native-modalize';
import { BlurView } from 'expo-blur';
import { useTripTheme } from '@/context/TripThemeProvider';

export type ThumbnailPickerModalRef = Modalize;

type ThumbnailPickerModalProps = {
  onSelect?: (url: string) => void;
};

type BlurModalContentProps = {
  thumbnails: { name: string; url: string }[];
  onSelect?: (url: string) => void;
  modalRef: React.RefObject<Modalize | null>;
};

function ThumbnailPickerModalHeader({
  modalRef,
}: {
  modalRef: React.RefObject<Modalize | null>;
}) {
  const theme = useTripTheme();

  return (
    <BlurView
      intensity={60}
      tint={theme.blurrierTint as 'light' | 'dark' | 'default'}
      experimentalBlurMethod="dimezisBlurView"
      style={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        paddingHorizontal: 20,
        paddingTop: 20,
        overflow: 'hidden',
      }}
    >
      <View className="flex-row items-center justify-center mb-4 relative">
        <TouchableOpacity
          onPress={() => modalRef.current?.close()}
          className="absolute top-5 left-5 z-10"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={{
              color: theme.primaryText,
              fontWeight: '600',
              fontSize: 15,
              marginTop: -2,
              marginLeft: -20,
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: theme.primaryText,
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 16,
            marginTop: 12,
          }}
        >
          Thumbnails
        </Text>
      </View>
    </BlurView>
  );
}

function BlurModalContent({
  thumbnails,
  onSelect,
  modalRef,
}: BlurModalContentProps) {
  const theme = useTripTheme();

  return (
    <View style={{ flex: 1, minHeight: 600, overflow: 'hidden' }}>
      <BlurView
        pointerEvents="none"
        intensity={60}
        tint={theme.blurrierTint as 'light' | 'dark' | 'default'}
        experimentalBlurMethod="dimezisBlurView"
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
          {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: 'hidden',
          },
        ]}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 4,
          paddingTop: 0,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
          }}
        >
          {thumbnails.map((item) => (
            <TouchableOpacity
              key={item.url}
              onPress={() => {
                if (onSelect) onSelect(item.url);
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
            <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

BlurModalContent.defaultProps = {
  onSelect: () => {},
};

const ThumbnailPickerModal = forwardRef<Modalize, ThumbnailPickerModalProps>(
  ({ onSelect = () => {} }, ref) => {
    const modalRef = useRef<Modalize>(null);
    const theme = useTripTheme();

    useImperativeHandle(ref, () => modalRef.current!);

    const [thumbnails, setThumbnails] = useState<
      { name: string; url: string }[]
    >([]);

    useEffect(() => {
      const fetchThumbnails = async () => {
        try {
          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/thumbnails`,
          );
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
        handleStyle={{ backgroundColor: '#ccc' }}
        handlePosition="inside"
        withHandle={false}
        modalStyle={{
          backgroundColor: 'transparent',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
        }}
        modalTopOffset={45}
        panGestureEnabled={false}
        panGestureComponentEnabled
        HeaderComponent={<ThumbnailPickerModalHeader modalRef={modalRef} />}
      >
        <BlurModalContent
          thumbnails={thumbnails}
          onSelect={onSelect}
          modalRef={modalRef}
        />
      </Modalize>
    );
  },
);

ThumbnailPickerModal.displayName = 'ThumbnailPickerModal';

export default ThumbnailPickerModal;
