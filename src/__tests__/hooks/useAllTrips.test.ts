import { renderHook } from '@testing-library/react-native';
import useAllTrips from '@/hooks/useAllTrips';
import { useUser } from '@/context/UserContext';

// Mock the useUser hook
jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

global.fetch = vi.fn();

describe('useAllTrips', () => {
  const mockUser = { id: '123' };
  const mockTrips = [{ id: 't1', title: 'Trip 1' }];

  beforeEach(() => {
    vi.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      authenticatedFetch: vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrips),
        }),
      ),
    });
  });

  it('fetches and sets trips', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAllTrips());

    await waitForNextUpdate();

    expect(result.current.trips).toEqual(mockTrips);
    expect(result.current.loading).toBe(false);
  });

  it('handles no user', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useAllTrips());

    expect(result.current.loading).toBe(false);
    expect(result.current.trips).toEqual([]);
  });
});
