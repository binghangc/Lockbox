import { renderHook, act, waitFor } from '@testing-library/react-native';
import useFriendSearch from '@/hooks/useFriendSearch';
import { useUser } from '@/context/UserContext';

jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

const mockFetch = jest.fn();

describe('useFriendSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      authenticatedFetch: mockFetch,
    });
  });

  it('should not search for queries < 2 chars', async () => {
    const { result } = renderHook(() => useFriendSearch('user-123'));

    act(() => {
      result.current.handleQueryChange('a');
    });

    expect(result.current.results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should fetch and populate results for valid query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'u1', username: 'foo', status: 'none' }],
    });

    const { result } = renderHook(() => useFriendSearch('user-123'));

    await act(async () => {
      await result.current.handleQueryChange('foo');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([
        { id: 'u1', username: 'foo', status: 'none' },
      ]);
    });
  });

  it('should send friend request and update status', async () => {
    const initialData = [{ id: 'u2', username: 'bar', status: 'none' }];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useFriendSearch('user-123'));

    await act(async () => {
      await result.current.handleQueryChange('bar');
    });

    await waitFor(() => {
      expect(result.current.results.length).toBe(1);
    });

    await act(async () => {
      await result.current.sendFriendRequest('u2');
    });

    expect(result.current.results).toEqual([
      { id: 'u2', username: 'bar', status: 'pending' },
    ]);
  });

  it('should handle errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'fail' }),
    });

    const { result } = renderHook(() => useFriendSearch('user-123'));

    await act(async () => {
      await result.current.handleQueryChange('fail');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([]);
    });

    expect(result.current.results).toEqual([]);
  });
});
