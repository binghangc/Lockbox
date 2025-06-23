import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useRecordHint from '@/hooks/video/useRecordHint';
import RecordHintBar from '@/components/video/recordHintBar';
import useHaptics from '@/hooks/useHaptics';
import PILLBAR from '@/constants/pillbarConfig';
import MainActionBubble from './mainActionBubble';

export default function TripPillbar({
  status,
  onLongPressBubble,
  onPressOutBubble,
}: {
  status: 'upcoming' | 'ongoing' | 'ended';
  onLongPressBubble?: () => void;
  onPressOutBubble?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { showHint, show } = useRecordHint();
  const { tap, hold } = useHaptics();

  let pillText = '';
  if (status === 'upcoming') {
    pillText = 'Superpower your vibechecks with our vibe genie';
  } else if (status === 'ongoing') {
    pillText = 'Insert vibechecks here';
  } else if (status === 'ended') {
    pillText = 'View your memories';
  }

  return (
    <>
      {/* Pillbar */}
      <View
        style={{
          position: PILLBAR.CONTAINER_POSITION,
          bottom: insets.bottom + PILLBAR.CONTAINER_BOTTOM_OFFSET,
          left: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          right: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
          zIndex: PILLBAR.CONTAINER_Z_INDEX,
        }}
      >
        {showHint && status === 'ongoing' && <RecordHintBar />}
        <LinearGradient
          start={PILLBAR.GRADIENT_START}
          end={PILLBAR.GRADIENT_END}
          locations={PILLBAR.GRADIENT_LOCATIONS}
          colors={PILLBAR.GRADIENT_COLORS}
          style={{
            borderRadius: PILLBAR.BORDER_RADIUS_FULL,
            padding: PILLBAR.GRADIENT_PADDING,
          }}
        >
          <View style={{ overflow: 'hidden', borderRadius: 9999 }}>
            <BlurView
              intensity={PILLBAR.BLUR_INTENSITY}
              tint={PILLBAR.BLUR_TINT}
              className="rounded-full flex-row justify-center items-center bg-white/5"
              style={[
                {
                  overflow: 'hidden',
                  borderRadius: PILLBAR.BORDER_RADIUS_FULL,
                  minHeight: PILLBAR.PILLBAR_HEIGHT,
                  paddingHorizontal: PILLBAR.PILLBAR_PADDING_HORIZONTAL,
                  paddingVertical: PILLBAR.PILLBAR_PADDING_VERTICAL,
                },
              ]}
            >
              <View className="flex-row items-center">
                <MainActionBubble
                  status={status}
                  onPress={() => {
                    if (status === 'ongoing') {
                      tap();
                      show();
                    }
                  }}
                  onLongPress={() => {
                    if (status === 'ongoing') {
                      hold();
                      onLongPressBubble?.();
                    }
                  }}
                  onPressOut={onPressOutBubble}
                />

                {/* Pill text */}
                <Text className="text-gray-100 text-xl font-semibold flex-1">
                  {pillText}
                </Text>
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
