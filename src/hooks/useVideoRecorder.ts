import { useRef, useState } from 'react';
import { CameraView } from 'expo-camera';

const useVideoRecorder = () => {
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 15,
        videoQuality: '480p',
        mute: false,
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
  };
};

export default useVideoRecorder;
