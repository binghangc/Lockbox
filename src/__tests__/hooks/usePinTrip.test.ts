import AsyncStorage from '@react-native-async-storage/async-storage';
import usePinTrip from '../../hooks/usePinTrip';

global.fetch = jest.fn();

describe('usePinTrip', () => {
  const tripId = 'trip123';
  const token = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem = jest.fn().mockResolvedValue(token);
  });

  it('calls fetch with correct URL and headers and calls onSuccess', async () => {
    const onSuccess = jest.fn();
    const mockResponse = {
      is_pinned: true,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const pinTrip = usePinTrip(tripId, onSuccess);
    await pinTrip();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/trips/${tripId}/pin`),
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
    expect(onSuccess).toHaveBeenCalledWith(true);
  });

  it('does not call fetch if no token', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const pinTrip = usePinTrip(tripId);
    await pinTrip();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('logs error if fetch fails', async () => {
    console.error = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'boom' }),
    });

    const pinTrip = usePinTrip(tripId);
    await pinTrip();

    expect(console.error).toHaveBeenCalledWith('Failed to toggle pin:', 'boom');
  });
});
