import { useRef, useState } from 'react';
import { CameraView } from 'expo-camera';
import VIDEO_CONFIG from '@/constants/videoConfig';

type UseVideoRecorderOptions = {
  onRecordingFinished?: (uri: string | null) => void;
};

const useVideoRecorder = ({ onRecordingFinished }: UseVideoRecorderOptions) => {
  const maxDurationMs = VIDEO_CONFIG.MAX_DURATION * 1000;
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const startRecording = async () => {
    console.log('[useVideoRecorder] === START RECORDING ===');
    console.log('[useVideoRecorder] isRecording:', isRecording);
    console.log(
      '[useVideoRecorder] cameraRef.current exists:',
      !!cameraRef.current,
    );

    if (isRecording) {
      console.warn(
        '[useVideoRecorder] Already recording, ignoring start request',
      );
      return;
    }

    if (!cameraRef.current) {
      console.warn(
        '[useVideoRecorder] Camera ref is null, cannot start recording',
      );
      return;
    }

    console.log('[useVideoRecorder] Setting isRecording to true');
    setIsRecording(true);
    setVideoUri(null); // Clear any previous video

    const options = {
      quality: VIDEO_CONFIG.VIDEO_QUALITY,
      maxDuration: VIDEO_CONFIG.MAX_DURATION,
      mute: false,
    };

    console.log('[useVideoRecorder] Recording options:', options);

    try {
      console.log(
        '[useVideoRecorder] Calling cameraRef.current.recordAsync()...',
      );
      const recordedVideo = await cameraRef.current.recordAsync(options);

      console.log('[useVideoRecorder] === RECORDING FINISHED ===');
      console.log(
        '[useVideoRecorder] Full recordedVideo object:',
        recordedVideo,
      );
      console.log(
        '[useVideoRecorder] recordedVideo type:',
        typeof recordedVideo,
      );
      console.log('[useVideoRecorder] recordedVideo.uri:', recordedVideo?.uri);

      const uri = recordedVideo?.uri || null;
      console.log('[useVideoRecorder] Final URI to set:', uri);

      setVideoUri(uri);
      setIsRecording(false);

      console.log(
        '[useVideoRecorder] Calling onRecordingFinished with URI:',
        uri,
      );
      onRecordingFinished?.(uri);
    } catch (error) {
      console.error('[useVideoRecorder] === RECORDING ERROR ===');
      console.error('[useVideoRecorder] Error type:', typeof error);
      console.error('[useVideoRecorder] Error message:', error);
      console.error(
        '[useVideoRecorder] Error stack:',
        error instanceof Error ? error.stack : 'No stack',
      );

      setIsRecording(false);
      setVideoUri(null);
      onRecordingFinished?.(null);
    }
  };

  const stopRecording = () => {
    console.log('[useVideoRecorder] === STOP RECORDING ===');
    console.log('[useVideoRecorder] isRecording:', isRecording);
    console.log(
      '[useVideoRecorder] cameraRef.current exists:',
      !!cameraRef.current,
    );

    if (cameraRef.current && isRecording) {
      console.log(
        '[useVideoRecorder] Calling cameraRef.current.stopRecording()',
      );
      try {
        cameraRef.current.stopRecording();
        console.log('[useVideoRecorder] stopRecording() called successfully');
      } catch (error) {
        console.error(
          '[useVideoRecorder] Error calling stopRecording():',
          error,
        );
      }
    } else {
      console.log(
        '[useVideoRecorder] Not stopping - either no camera ref or not recording',
      );
    }

    setIsRecording(false);
  };

  return {
    cameraRef,
    isRecording,
    videoUri,
    startRecording,
    stopRecording,
    maxDurationMs,
  };
};

export default useVideoRecorder;
