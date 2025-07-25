import { renderHook, act, waitFor } from '@testing-library/react-native';
import useItineraries from '@/hooks/useItineraries';
import { useUser } from '@/context/UserContext';

jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

const mockFetch = jest.fn();

const tripDays = ['2025-07-22', '2025-07-23'];
const sampleResponse = [
  { date: '2025-07-22', itinerary: 'Visit Zermatt' },
  { date: '2025-07-23', itinerary: '' },
];

describe('useItineraries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      authenticatedFetch: mockFetch,
    });
  });

  it('fetches and maps itineraries correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleResponse,
    });

    const { result } = renderHook(() => useItineraries('trip-1', tripDays));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dailyPlans).toEqual(['Visit Zermatt', '']);
    expect(result.current.isEditing).toBe(true);
    expect(result.current.hasItinerary).toBe(true);
  });

  it('handles submitItinerary success', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => sampleResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useItineraries('trip-1', tripDays));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const onSuccess = jest.fn();
    await act(async () => {
      await result.current.submitItinerary(['Go hike', 'Swim'], onSuccess);
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles submitItinerary error', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => sampleResponse,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Submit error' }),
      });

    const { result } = renderHook(() => useItineraries('trip-1', tripDays));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const onError = jest.fn();
    await act(async () => {
      await result.current.submitItinerary(
        ['Go hike', 'Swim'],
        jest.fn(),
        onError,
      );
    });

    expect(onError).toHaveBeenCalledWith('Submit error');
    expect(result.current.isSubmitting).toBe(false);
  });
});
