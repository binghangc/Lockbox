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
    if (isRecording || !cameraRef.current) {
      console.warn('Camera is not ready or already recording');
      return;
    }

    setIsRecording(true);
    const options = {
      quality: '480p',
      maxDuration: maxDurationSec,
      mute: false,
    };

    try {
      const recordedVideo = await cameraRef.current.recordAsync(options);
      const uri = recordedVideo?.uri ?? null;
      console.log('[useVideoRecorder] 📼 Recorded video URI:', uri);
      setVideoUri(uri);
      onRecordingFinished?.(uri);
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    cameraRef.current?.stopRecording();
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
