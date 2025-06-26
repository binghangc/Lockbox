import { useRef, useState } from 'react';
import { CameraView } from 'expo-camera';

type UseVideoRecorderOptions = {
  maxDurationSec: number;
  onRecordingFinished?: (uri: string | null) => void;
};

const useVideoRecorder = ({
  maxDurationSec,
  onRecordingFinished,
}: UseVideoRecorderOptions) => {
  const maxDurationMs = maxDurationSec * 1000;
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const startRecording = async () => {
    console.log('[useVideoRecorder] startRecording called');
    console.log('[useVideoRecorder] Camera ref:', cameraRef.current);
    console.log('[useVideoRecorder] isRecording:', isRecording);

    if (isRecording || !cameraRef.current) {
      console.warn('Camera is not ready or already recording');
      return;
    }

    console.log(
      '[useVideoRecorder] Setting isRecording to true and starting...',
    );
    setIsRecording(true);
    const options = {
      quality: '1080p' as const,
      maxDuration: maxDurationSec,
      mute: false,
    };

    console.log('[useVideoRecorder] Recording options:', options);

    try {
      console.log('[useVideoRecorder] Calling recordAsync...');
      const recordedVideo = await cameraRef.current.recordAsync(options);
      const uri = recordedVideo?.uri ?? null;
      console.log('[useVideoRecorder] 📼 Recorded video URI:', uri);
      setVideoUri(uri);
      setIsRecording(false);
      onRecordingFinished?.(uri);
    } catch (error) {
      console.error('[useVideoRecorder] Recording error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log(
      '[useVideoRecorder] stopRecording called, isRecording:',
      isRecording,
    );
    if (cameraRef.current && isRecording) {
      console.log('[useVideoRecorder] Stopping active recording');
      cameraRef.current.stopRecording();
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
