import { renderHook, waitFor } from '@testing-library/react-native';
import useOrbsByVibecheck from '@/hooks/useOrbsByVibecheck';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const mockToken = 'mock_token';
const mockVibecheckId = 'vibecheck_123';
const mockResponse = {
  orbs: [
    {
      id: 'orb_1',
      user_id: 'user_1',
      trip_id: 'trip_1',
      hls_key: 'key1.m3u8',
      created_at: '2025-07-22T12:00:00Z',
      hlsUrl: 'https://mock.cdn/orb1.m3u8',
      user: {
        id: 'user_1',
        name: 'John',
        avatar_url: 'https://img.com/1.png',
      },
    },
  ],
};

describe('useOrbsByVibecheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches orbs and sets them correctly', async () => {
    AsyncStorage.getItem = jest.fn().mockResolvedValue(mockToken);
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });

    const { result } = renderHook(() => useOrbsByVibecheck(mockVibecheckId));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orbs).toHaveLength(1);
    expect(result.current.orbs[0].id).toBe('orb_1');
  });

  it('handles malformed JSON response gracefully', async () => {
    AsyncStorage.getItem = jest.fn().mockResolvedValue(mockToken);
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html>this is not JSON</html>'),
    });

    const { result } = renderHook(() => useOrbsByVibecheck(mockVibecheckId));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orbs).toEqual([]);
  });

  it('skips fetch if no vibecheckId is provided', async () => {
    const { result } = renderHook(() => useOrbsByVibecheck(''));
    expect(result.current.loading).toBe(false);
    expect(result.current.orbs).toEqual([]);
  });
});
