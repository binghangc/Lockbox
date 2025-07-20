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
        console.log(
          '[videoBubbleController] === RECORDING FINISHED CALLBACK ===',
        );
        console.log('[videoBubbleController] URI received:', uri);
        console.log(
          '[videoBubbleController] wasCancelled.current:',
          wasCancelled.current,
        );

        // Don't hide preview immediately if cancelled - let user see what happened
        if (!wasCancelled.current) {
          setShowPreview(false);
        }

        if (wasCancelled.current) {
          console.log(
            '[videoBubbleController] Recording was cancelled — skipping upload',
          );
          // Reset for next time but don't clear immediately
          setTimeout(() => {
            wasCancelled.current = false;
            setShowPreview(false);
          }, 1000);
          return;
        }

        if (!uri) {
          console.warn(
            '[videoBubbleController] No URI received from recording',
          );
          // Show error state briefly
          setTimeout(() => setShowPreview(false), 1500);
          return;
        }

        if (!tripId || !userId || !token) {
          console.warn(
            '[videoBubbleController] Missing required data for upload:',
            {
              tripId: !!tripId,
              userId: !!userId,
              token: !!token,
            },
          );
          setTimeout(() => setShowPreview(false), 1500);
          return;
        }

        try {
          console.log('[videoBubbleController] Starting upload...');
          const res = await uploadOrb({
            uri,
            tripId,
            userId,
            vibecheckId,
            token,
          });
          console.log('[uploadOrb] success:', res);
          setShowPreview(false);
        } catch (err) {
          console.error('[uploadOrb] error:', err);
          setTimeout(() => setShowPreview(false), 1500);
        }
      },
    });

  const onLongPress = async () => {
    console.log('[videoBubbleController] === LONG PRESS ===');

    if (!granted) {
      console.log('[videoBubbleController] Requesting permissions...');
      const permissionResult = await requestPermissions();
      if (!permissionResult) {
        console.warn('[videoBubbleController] Permissions denied');
        return;
      }
    }

    console.log(
      '[videoBubbleController] Showing preview and setting up recording',
    );
    wasCancelled.current = false;
    setShowPreview(true);
    setShouldStartRecording(true);
  };

  const onPressOut = () => {
    console.log('[videoBubbleController] === PRESS OUT (CANCEL) ===');
    wasCancelled.current = true;

    // Only try to stop if actually recording
    if (isRecording) {
      stopRecording();
    }

    setShouldStartRecording(false);
    // Don't hide preview immediately - let the recording finish gracefully
    setTimeout(() => {
      setShowPreview(false);
      wasCancelled.current = false;
    }, 500);
  };

  const onSend = () => {
    console.log('[videoBubbleController] === SEND ===');
    wasCancelled.current = false;

    // Only try to stop if actually recording
    if (isRecording) {
      stopRecording();
    }

    setShouldStartRecording(false);
    // Don't hide preview immediately - let the callback handle it
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
            console.log('[videoBubbleController] === CAMERA READY ===');
            console.log(
              '[videoBubbleController] shouldStartRecording:',
              shouldStartRecording,
            );
            console.log(
              '[videoBubbleController] wasCancelled.current:',
              wasCancelled.current,
            );
            console.log(
              '[videoBubbleController] cameraRef.current exists:',
              !!cameraRef.current,
            );

            if (
              shouldStartRecording &&
              !wasCancelled.current &&
              cameraRef.current
            ) {
              console.log(
                '[videoBubbleController] Starting recording after camera ready',
              );
              setShouldStartRecording(false);

              // Longer delay to ensure camera is fully ready
              setTimeout(() => {
                if (!wasCancelled.current && cameraRef.current) {
                  console.log(
                    '[videoBubbleController] Calling startRecording...',
                  );
                  startRecording();
                } else {
                  console.log(
                    '[videoBubbleController] Cancelled or camera lost before recording',
                  );
                }
              }, 300);
            } else {
              console.log('[videoBubbleController] Not starting recording:', {
                shouldStartRecording,
                wasCancelled: wasCancelled.current,
                cameraExists: !!cameraRef.current,
              });
            }
          }}
        />
      )}
    </>
  );
}
