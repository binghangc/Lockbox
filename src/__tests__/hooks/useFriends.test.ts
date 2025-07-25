import { renderHook, act, waitFor } from '@testing-library/react-native';
import useFriends from '@/hooks/useFriends';
import { useUser } from '@/context/UserContext';

jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

describe('useFriends', () => {
  const mockFriends = [
    { id: '1', name: 'Alice', friendshipId: 'f1' },
    { id: '2', name: 'Bob', friendshipId: 'f2' },
  ];

  const mockFetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockFriends),
    }),
  );

  beforeEach(() => {
    jest.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({
      user: { id: '123' },
      authenticatedFetch: mockFetch,
    });
  });

  it('fetches friends and updates count', async () => {
    const countSpy = jest.fn();

    const { result } = renderHook(() => useFriends(countSpy));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.friends).toEqual(mockFriends);
    expect(countSpy).toHaveBeenCalledWith(mockFriends.length);
  });

  it('handles missing user', async () => {
    (useUser as jest.Mock).mockReturnValue({
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
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useFriends());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.friends).toEqual([]);
  });

  it('can manually refresh with listFriends()', async () => {
    const { result } = renderHook(() => useFriends());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.friends).toEqual(mockFriends);

    await act(async () => {
      await result.current.listFriends();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
