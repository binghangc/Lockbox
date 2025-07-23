import { renderHook, act } from '@testing-library/react-native';
import useTodayVibecheck from '@/hooks/useTodayVibecheck';
import { useUser } from '@/context/UserContext';
import * as Alert from 'react-native';

// Mock user context
jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'Alert').mockImplementation(() => ({
  alert: jest.fn(),
}));

// Freeze today's date
jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs');
  return () => actualDayjs('2025-07-23');
});

describe('useTodayVibecheck', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user123' },
      authenticatedFetch: mockFetch,
    });
  });

  it('skips fetch when tripStatus !== "ongoing"', async () => {
    const { result } = renderHook(() =>
      useTodayVibecheck('trip123', 'upcoming'),
    );
    expect(result.current.vibecheck).toBeNull();
    expect(result.current.vibecheckId).toBeNull();
    expect(result.current.vcloading).toBe(false);
  });

  it("fetches today's vibecheck when trip is ongoing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        vibecheck: 'Sample vibe',
        vibecheck_id: 'vibe-001',
      }),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useTodayVibecheck('trip123', 'ongoing'),
    );

    await waitForNextUpdate();

    expect(result.current.vibecheck).toBe('Sample vibe');
    expect(result.current.vibecheckId).toBe('vibe-001');
    expect(result.current.vcloading).toBe(false);
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Not found' }),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { waitForNextUpdate } = renderHook(() =>
      useTodayVibecheck('trip123', 'ongoing'),
    );

    await waitForNextUpdate();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching vibecheck:',
      'Not found',
    );
    consoleSpy.mockRestore();
  });

  it('reshuffles if allowed', async () => {
    const mockReshuffle = {
      ok: true,
      json: async () => ({
        reshuffleAllowed: true,
        vibecheck: 'New vibe',
        vibecheck_id: 'vibe-002',
      }),
    };

    // first fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        vibecheck: 'Old vibe',
        vibecheck_id: 'vibe-001',
      }),
    });

    // reshuffle PATCH
    mockFetch.mockResolvedValueOnce(mockReshuffle);

    const { result, waitForNextUpdate } = renderHook(() =>
      useTodayVibecheck('trip123', 'ongoing'),
    );

    await waitForNextUpdate();

    await act(async () => {
      await result.current.reshuffleVibecheck();
    });

    expect(result.current.vibecheck).toBe('New vibe');
    expect(result.current.vibecheckId).toBe('vibe-002');
  });

  it('blocks reshuffle if not allowed', async () => {
    const alertSpy = jest.spyOn(Alert.Alert, 'alert');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        vibecheck: 'Initial vibe',
        vibecheck_id: 'vibe-001',
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reshuffleAllowed: false,
        message: 'Already submitted',
      }),
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useTodayVibecheck('trip123', 'ongoing'),
    );

    await waitForNextUpdate();

    await act(async () => {
      await result.current.reshuffleVibecheck();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Reshuffle Blocked',
      'Already submitted',
    );
  });
});
