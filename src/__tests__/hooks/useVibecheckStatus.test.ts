// __tests__/useVibeCheckStatus.test.ts

import { renderHook, waitFor } from '@testing-library/react-native';
import useVibeCheckStatus from '@/hooks/useVibecheckStatus'; // adjust path as needed

jest.mock('@/context/UserContext', () => ({
  useUser: () => ({
    user: { id: 'user-123' },
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mock-token')),
}));

describe('useVibeCheckStatus', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns status when user has responded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            orbs: [
              {
                id: 'orb-1',
                user_id: 'user-123',
                created_at: '2025-07-23T12:00:00Z',
              },
            ],
          }),
        ),
    });

    const { result } = renderHook(() => useVibeCheckStatus('vibecheck-abc'));

    await waitFor(() => !result.current.loading);

    expect(result.current.status).toEqual({
      userHasResponded: true,
      orbId: 'orb-1',
      submittedAt: '2025-07-23T12:00:00Z',
      anyoneHasResponded: true,
    });

    expect(result.current.error).toBeNull();
  });

  it('handles when nobody has responded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ orbs: [] })),
    });

    const { result } = renderHook(() => useVibeCheckStatus('vibecheck-xyz'));

    await waitFor(() => !result.current.loading);

    expect(result.current.status).toEqual({
      userHasResponded: false,
      orbId: null,
      submittedAt: null,
      anyoneHasResponded: false,
    });
  });

  it('handles API error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ error: 'Server error' })),
    });

    const { result } = renderHook(() => useVibeCheckStatus('vibecheck-error'));

    await waitFor(() => !result.current.loading);

    expect(result.current.status).toBeNull();
    expect(result.current.error?.message).toBe('Server error');
  });

  it('handles invalid JSON', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html>not json</html>'),
    });

    const { result } = renderHook(() =>
      useVibeCheckStatus('vibecheck-badjson'),
    );

    await waitFor(() => !result.current.loading);

    expect(result.current.status).toBeNull();
    expect(result.current.error?.message).toBe('Server returned invalid JSON');
  });
});
