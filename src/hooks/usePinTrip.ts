import AsyncStorage from '@react-native-async-storage/async-storage';

export default function usePinTrip(
  tripId: string,
  onSuccess?: (newPinState: boolean) => void,
) {
  const pinTrip = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/pin`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle pin state');

      onSuccess?.(data.is_pinned); // optional: let caller know new state
    } catch (err) {
      if (err instanceof Error) {
        console.error('Failed to toggle pin:', err.message);
      } else {
        console.error('Failed to toggle pin:', err);
      }
    }
  };

  return pinTrip;
}
