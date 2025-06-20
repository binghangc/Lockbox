import React, { useState } from 'react';
import useVideoPermissions from '@/hooks/useVideoPermissions';
import useVideoRecorder from '@/hooks/useVideoRecorder';
import VideoBubblePreview from './videoBubblePreview';

type Props = {
  children: (props: {
    onLongPress: () => void;
    onPressOut: () => void;
    isRecording: boolean;
    videoUri: string | null;
  }) => React.ReactNode;
};

export default function VideoBubbleController({ children }: Props) {
  const { granted, requestPermissions } = useVideoPermissions();
  const { cameraRef, isRecording, startRecording, stopRecording, videoUri } =
    useVideoRecorder();

  const [showPreview, setShowPreview] = useState(false);

  const onLongPress = async () => {
    if (!granted) {
      await requestPermissions();
    }
    setShowPreview(true);
    await startRecording();
  };

  const onPressOut = () => {
    stopRecording();
    setShowPreview(false);
  };

  return (
    <>
      {children({
        onLongPress,
        onPressOut,
        isRecording,
        videoUri,
      })}
      {showPreview && <VideoBubblePreview cameraRef={cameraRef} />}
    </>
  );
}
