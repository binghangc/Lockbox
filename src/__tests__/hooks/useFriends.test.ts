import { renderHook, act } from '@testing-library/react-native';
import useFriends from '@/hooks/useFriends';
import { useUser } from '@/context/UserContext';

vi.mock('@/context/UserContext', () => ({
  useUser: vi.fn(),
}));

describe('useFriends', () => {
  const mockFriends = [
    { id: '1', name: 'Alice', friendshipId: 'f1' },
    { id: '2', name: 'Bob', friendshipId: 'f2' },
  ];

  const mockFetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockFriends),
    }),
  );

  beforeEach(() => {
    vi.clearAllMocks();

    (useUser as vi.Mock).mockReturnValue({
      user: { id: '123' },
      authenticatedFetch: mockFetch,
    });
  });

  it('fetches friends and updates count', async () => {
    const countSpy = vi.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useFriends(countSpy),
    );

    await waitForNextUpdate();

    expect(result.current.friends).toEqual(mockFriends);
    expect(result.current.loading).toBe(false);
    expect(countSpy).toHaveBeenCalledWith(mockFriends.length);
  });

  it('handles missing user', async () => {
    (useUser as vi.Mock).mockReturnValue({
      user: null,
      authenticatedFetch: mockFetch,
    });

    const { result } = renderHook(() => useFriends());

    expect(result.current.loading).toBe(false);
    expect(result.current.friends).toEqual([]);
  });

  it('handles fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed' }),
    });

    const { result, waitForNextUpdate } = renderHook(() => useFriends());

    await waitForNextUpdate();

    expect(result.current.friends).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('can manually refresh with listFriends()', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFriends());

    await waitForNextUpdate();
    expect(result.current.friends).toEqual(mockFriends);

    await act(async () => {
      await result.current.listFriends();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
