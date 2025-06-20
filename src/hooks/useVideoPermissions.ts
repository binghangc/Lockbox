import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

export default function useVideoPermissions() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const granted =
    cameraPermission?.granted === true &&
    microphonePermission?.granted === true;

  const requestPermissions = async () => {
    await requestCameraPermission();
    await requestMicrophonePermission();
  };

  return {
    granted,
    requestPermissions,
    cameraStatus: cameraPermission?.status,
    micStatus: microphonePermission?.status,
  };
}
