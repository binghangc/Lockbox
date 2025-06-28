import { View, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PILLBAR from '@/constants/pillbarConfig';
import useHaptics from '@/hooks/useHaptics';
import useRecordHint from '@/hooks/video/useRecordHint';
import RecordHintBar from '@/components/video/recordHintBar';
import React from 'react';
import VideoBubbleController from '@/components/video/videoBubbleController';
import TripPillbar from '@/components/tripPillbar';
import useTodayVibecheck from '@/hooks/useTodayVibecheck';
import VibecheckShuffleButton from '@/components/vibecheckShuffleButton';
import { useUser } from '@/components/UserContext';
import confettiJson from '../../assets/animations/confetti.json';

type TripPillbarContainerProps = {
  tripId: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  isHost: boolean;
  handlePress: () => void;
};

export default function TripPillbarContainer({
  tripId,
  status,
  isHost,
  handlePress,
}: TripPillbarContainerProps) {
  const insets = useSafeAreaInsets();
  const { tap, hold, send, cancel } = useHaptics();
  const { showHint, show } = useRecordHint();
  const { vibecheck, vibecheckId, reshuffleVibecheck, vcloading } =
    useTodayVibecheck(tripId, status);
  const { user } = useUser();

  const confettiRef = React.useRef<LottieView>(null);
  const triggerConfetti = () => {
    confettiRef.current?.play();
  };
  const { width, height } = Dimensions.get('window');

  let pillText = '';
  if (status === 'upcoming') {
    pillText = 'Superpower your vibechecks with our vibe genie';
  } else if (status === 'ongoing') {
    pillText = vcloading
      ? 'Loading vibecheck...'
      : vibecheck || 'No vibecheck for today.';
  } else if (status === 'ended') {
    pillText = 'View your memories';
  }

  const bottomAccessory =
    isHost && status === 'ongoing' ? (
      <VibecheckShuffleButton
        onPress={reshuffleVibecheck}
        loading={vcloading}
      />
    ) : null;

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
      <LottieView
        ref={confettiRef}
        source={confettiJson}
        autoPlay={false}
        loop={false}
        resizeMode="cover"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <VideoBubbleController
        tripId={tripId}
        userId={user?.id}
        vibecheckId={vibecheckId ?? undefined}
      >
        {({ onLongPress, onPressOut, onSend }) => (
          <TripPillbar
            status={status}
            pillText={pillText}
            bottomAccessory={bottomAccessory}
            onPressBubble={
              status === 'ongoing'
                ? () => {
                    tap();
                    show();
                    handlePress();
                  }
                : handlePress
            }
            onLongPressBubble={
              status === 'ongoing'
                ? () => {
                    hold();
                    onLongPress();
                  }
                : undefined
            }
            onPressOutBubble={
              status === 'ongoing'
                ? () => {
                    console.log('cancel');
                    onPressOut();
                    cancel(); // haptics
                  }
                : undefined
            }
            onSwipeSend={
              status === 'ongoing'
                ? () => {
                    console.log('send');
                    onSend();
                    send(); // haptics
                    triggerConfetti(); // 🎉
                  }
                : undefined
            }
          />
        )}
      </VideoBubbleController>
    </>
  );
}
