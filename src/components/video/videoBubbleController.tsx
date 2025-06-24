import React, { useState } from 'react';
import useVideoPermissions from '@/hooks/video/useVideoPermissions';
import useVideoRecorder from '@/hooks/video/useVideoRecorder';
import VideoBubblePreview from './videoBubblePreview';

type Props = {
  children: (props: {
    onLongPress: () => void;
    onPressOut: () => void;
    onSend: () => void;
    isRecording: boolean;
    videoUri: string | null;
  }) => React.ReactNode;
};

export default function VideoBubbleController({ children }: Props) {
  // VIDEO-BUBBLE SIZE
  const bubbleSize = 350;
  // MAX-VIDEO DURATION (in sec)
  const maxDuration = 15;

  const { granted, requestPermissions } = useVideoPermissions();
  const [showPreview, setShowPreview] = useState(false);
  const {
    cameraRef,
    isRecording,
    startRecording,
    stopRecording,
    videoUri,
    maxDurationMs,
  } = useVideoRecorder({
    maxDurationSec: maxDuration,
    onRecordingFinished: () => setShowPreview(false),
  });

  const onLongPress = async () => {
    if (!granted) {
      await requestPermissions();
    }
    setShowPreview(true);
    await startRecording();
  };

  const onPressOut = () => {
    stopRecording();
  };

  const onSend = () => {
    stopRecording();
  };

  return (
    <>
      {children({
        onLongPress,
        onPressOut,
        onSend,
        isRecording,
        videoUri,
      })}
      {showPreview && (
        <VideoBubblePreview
          cameraRef={cameraRef}
          size={bubbleSize}
          maxDurationMs={maxDurationMs}
        />
      )}
    </>
  );
}
