import { renderHook, waitFor } from '@testing-library/react-native';
import useAllTrips from '@/hooks/useAllTrips';
import { useUser } from '@/context/UserContext';

// Mock the useUser hook
jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

global.fetch = jest.fn();

describe('useAllTrips', () => {
  const mockUser = { id: '123' };
  const mockTrips = [{ id: 't1', title: 'Trip 1' }];

  beforeEach(() => {
    jest.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      authenticatedFetch: jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrips),
        }),
      ),
    });
  });

  it('fetches and sets trips', async () => {
    const { result } = renderHook(() => useAllTrips());
    await waitFor(() => {
      expect(result.current.trips).toEqual(mockTrips);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles no user', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useAllTrips());

    expect(result.current.loading).toBe(false);
    expect(result.current.trips).toEqual([]);
  });
});
