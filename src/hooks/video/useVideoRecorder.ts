import { useRef, useState } from 'react';
import { CameraView } from 'expo-camera';

type UseVideoRecorderOptions = {
  maxDurationSec: number;
};

const useVideoRecorder = ({ maxDurationSec }: UseVideoRecorderOptions) => {
  const maxDurationMs = maxDurationSec * 1000;
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: maxDurationSec,
      });
      if (video && video.uri) {
        setVideoUri(video.uri);
      }
    } catch (error) {
      console.error('Recording failed:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
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
