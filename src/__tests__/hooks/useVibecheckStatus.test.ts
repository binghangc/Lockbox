import { renderHook, waitFor } from '@testing-library/react-native';
import useVibeCheckStatus from '@/hooks/useVibecheckStatus';
import { useUser } from '@/context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

global.fetch = jest.fn();

describe('useVibeCheckStatus', () => {
  const mockFetch = fetch as jest.Mock;
  const mockGetItem = AsyncStorage.getItem as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user123' },
    });
  });

  it('returns status when user has responded', async () => {
    mockGetItem.mockResolvedValueOnce('mock-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            orbs: [
              {
                id: 'orb-1',
                user_id: 'user123',
                created_at: '2025-07-23T12:00:00Z',
              },
            ],
          }),
        ),
    });

    const { result } = renderHook(() => useVibeCheckStatus('vibecheck-abc'));

    await waitFor(() =>
      expect(result.current.status).toEqual({
        userHasResponded: true,
        orbId: 'orb-1',
        submittedAt: '2025-07-23T12:00:00Z',
        anyoneHasResponded: true,
      }),
    );

    expect(result.current.error).toBeNull();
  });

  it('handles when nobody has responded', async () => {
    mockGetItem.mockResolvedValueOnce('mock-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ orbs: [] })),
    });

    const { result } = renderHook(() => useVibeCheckStatus('vibecheck-empty'));

    await waitFor(() =>
      expect(result.current.status).toEqual({
        userHasResponded: false,
        orbId: null,
        submittedAt: null,
        anyoneHasResponded: false,
      }),
    );

    expect(result.current.error).toBeNull();
  });

  it('handles API error', async () => {
    mockGetItem.mockResolvedValueOnce('mock-token');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ error: 'Server error' })),
    });

    const { result } = renderHook(() => useVibeCheckStatus('vibecheck-fail'));

    await waitFor(() =>
      expect(result.current.error?.message).toBe('Server error'),
    );
  });

  it('handles invalid JSON', async () => {
    mockGetItem.mockResolvedValueOnce('mock-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html>bad</html>'),
    });

    const { result } = renderHook(() => useVibeCheckStatus('vibecheck-bad'));

    await waitFor(() =>
      expect(result.current.error?.message).toBe(
        'Server returned invalid JSON',
      ),
    );

    expect(result.current.status).toBeNull();
  });

  it('skips fetch if no user or vibecheckId', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useVibeCheckStatus(''));

    await waitFor(() => !result.current.loading);

    expect(result.current.status).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
