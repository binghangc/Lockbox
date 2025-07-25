import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePillbarConfig from '@/constants/pillbarConfig';
import useHaptics from '@/hooks/useHaptics';
import useRecordHint from '@/hooks/video/useRecordHint';
import RecordHintBar from '@/components/video/recordHintBar';
import VideoBubbleController from '@/components/video/videoBubbleController';
import TripPillbar from '@/components/tripPillbar';
import useTodayVibecheck from '@/hooks/useTodayVibecheck';
import VibecheckShuffleButton from '@/components/vibecheckShuffleButton';
import { useUser } from '@/context/UserContext';
import useVibeCheckStatus from '@/hooks/useVibecheckStatus';

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

  const { status: vibecheckStatus, loading: statusLoading } =
    useVibeCheckStatus(vibecheckId ?? '');

  const PILLBAR = usePillbarConfig();

  let pillText = '';
  if (status === 'upcoming') {
    pillText = 'Superpower your vibechecks\nwith our vibe genie';
  } else if (status === 'ongoing') {
    pillText = vcloading
      ? 'Loading vibecheck...'
      : vibecheck || 'No vibecheck for today.';
  } else if (status === 'ended') {
    pillText = 'View your memories';
  }

  const bottomAccessory =
    isHost &&
    status === 'ongoing' &&
    !statusLoading &&
    !vibecheckStatus?.anyoneHasResponded ? (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 7,
          marginRight: 5,
        }}
      >
        <VibecheckShuffleButton
          onPress={reshuffleVibecheck}
          loading={vcloading}
        />
      </View>
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
            submittedByUser={vibecheckStatus?.userHasResponded}
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
                  }
                : undefined
            }
          />
        )}
      </VideoBubbleController>
    </>
  );
}
