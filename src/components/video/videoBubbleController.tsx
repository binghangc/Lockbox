import React, { useState, useRef } from 'react';
import useVideoPermissions from '@/hooks/video/useVideoPermissions';
import useVideoRecorder from '@/hooks/video/useVideoRecorder';
import uploadOrb from '@/utils/orbs';
import { useUser } from '@/context/UserContext';
import VideoBubblePreview from './videoBubblePreview';

type Props = {
  children: (props: {
    onLongPress: () => void;
    onPressOut: () => void;
    onSend: () => void;
    isRecording: boolean;
    videoUri: string | null;
    tripId?: string;
    userId?: string;
    vibecheckId?: string | null;
  }) => React.ReactNode;
  tripId?: string;
  userId?: string;
  vibecheckId?: string | null;
};

export default function VideoBubbleController({
  children,
  tripId,
  userId,
  vibecheckId,
}: Props) {
  const { granted, requestPermissions } = useVideoPermissions();
  const [showPreview, setShowPreview] = useState(false);
  const [shouldStartRecording, setShouldStartRecording] = useState(false);
  const { token } = useUser();
  const wasCancelled = useRef(false);

  const { cameraRef, isRecording, startRecording, stopRecording, videoUri } =
    useVideoRecorder({
      onRecordingFinished: async (uri) => {
        setShowPreview(false);

        if (wasCancelled.current) {
          console.log(
            '[videoBubbleController] Recording was cancelled — skipping upload',
          );
          return;
        }

        if (!uri || !tripId || !userId || !token) {
          console.log(userId);
          console.warn('[videoBubbleController] Missing data for uploadOrb');
          return;
        }

        try {
          const res = await uploadOrb({
            uri,
            tripId,
            userId,
            vibecheckId,
            token,
          });
          console.log('[uploadOrb] success:', res);
        } catch (err) {
          console.error('[uploadOrb] error:', err);
        }
      },
    });

  const onLongPress = async () => {
    if (!granted) {
      await requestPermissions();
    }
    console.log(
      'Long press - showing preview and setting flag to start recording',
    );
    setShowPreview(true);
    setShouldStartRecording(true);
  };

  const onPressOut = () => {
    console.log('Press out - canceling');
    wasCancelled.current = true;
    stopRecording();
    setShowPreview(false);
    setShouldStartRecording(false);
  };

  const onSend = () => {
    console.log('Send - stopping recording');
    wasCancelled.current = false;
    stopRecording();
    setShouldStartRecording(false);
    setShowPreview(false);
  };

  return (
    <>
      {children({
        onLongPress,
        onPressOut,
        onSend,
        isRecording,
        videoUri,
        tripId,
        userId,
        vibecheckId,
      })}
      {showPreview && (
        <VideoBubblePreview
          cameraRef={cameraRef}
          onCameraReady={() => {
            console.log('[📷 Camera] onCameraReady fired!');
            if (shouldStartRecording) {
              console.log('[📹] Starting recording now...');
              setShouldStartRecording(false); // Reset flag
              setTimeout(() => {
                startRecording();
              }, 100);
            }
          }}
        />
      )}
    </>
  );
}
