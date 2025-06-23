import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PILLBAR from '@/constants/pillbarConfig';
import useHaptics from '@/hooks/useHaptics';
import useRecordHint from '@/hooks/video/useRecordHint';
import RecordHintBar from '@/components/video/recordHintBar';
import React from 'react';
import VideoBubbleController from '@/components/video/videoBubbleController';
import TripPillbar from '@/components/tripPillbar';

type TripPillbarContainerProps = {
  status: 'upcoming' | 'ongoing' | 'ended';
};

export default function TripPillbarContainer({
  status,
}: TripPillbarContainerProps) {
  const insets = useSafeAreaInsets();
  const { tap, hold } = useHaptics();
  const { showHint, show } = useRecordHint();

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
      {showHint && status === 'ongoing' && (
        <View
          style={{
            position: PILLBAR.CONTAINER_POSITION,
            bottom: insets.bottom + PILLBAR.CONTAINER_BOTTOM_OFFSET + 3,
            left: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
            right: PILLBAR.CONTAINER_HORIZONTAL_MARGIN,
            zIndex: PILLBAR.CONTAINER_Z_INDEX + 1,
          }}
        >
          <RecordHintBar />
        </View>
      )}
      <VideoBubbleController>
        {({ onLongPress, onPressOut }) => (
          <TripPillbar
            status={status}
            pillText={pillText}
            onPressBubble={
              status === 'ongoing'
                ? () => {
                    tap();
                    show();
                  }
                : undefined
            }
            onLongPressBubble={
              status === 'ongoing'
                ? () => {
                    hold();
                    onLongPress();
                  }
                : undefined
            }
            onPressOutBubble={status === 'ongoing' ? onPressOut : undefined}
          />
        )}
      </VideoBubbleController>
    </>
  );
}
