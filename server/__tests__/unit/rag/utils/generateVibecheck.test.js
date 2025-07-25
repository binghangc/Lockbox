const {
  generateVibeCheck,
} = require('../../../../rag/utils/generateVibeCheck.js');

jest.mock('../../../../utils/geminiclient.js', () => ({
  chatModel: { invoke: jest.fn() },
}));

jest.mock('../../../../rag/utils/retrieveSimilarItineraryChunks.js', () => ({
  retrieveSimilarItineraryChunks: jest.fn(),
}));

const mockSelect = jest.fn();
jest.mock('../../../../utils/supabaseAdminClient.js', () => ({
  from: jest.fn(() => ({ select: mockSelect })),
}));

const { chatModel } = require('../../../../utils/geminiclient.js');
const {
  retrieveSimilarItineraryChunks,
} = require('../../../../rag/utils/retrieveSimilarItineraryChunks.js');
const supabase = require('../../../../utils/supabaseAdminClient.js');

describe('generateVibeCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultInput = {
    itineraryText: 'Visit a hilltop temple and eat laksa.',
    tripDate: '2025-07-29',
    tripTitle: 'Spicy Views',
    country: 'Malaysia',
    description: 'Climbing Batu Caves and eating after.',
  };

  it('returns a generated vibe check with examples from similar trips', async () => {
    // mock similar chunks
    retrieveSimilarItineraryChunks.mockResolvedValue([
      { metadata: { id: 'chunk1' } },
      { metadata: { id: 'chunk2' } },
    ]);

    // mock vibechecks from Supabase
    mockSelect.mockResolvedValue({
      data: [
        { prompt: 'Why did we hike for this?', trip_id: 'trip1' },
        { prompt: 'Spicy sweat unlocked', trip_id: 'trip2' },
      ],
      error: null,
    });

    // mock Gemini response
    chatModel.invoke.mockResolvedValue({
      content: 'Hot sweat, hotter laksa moment',
    });

    const result = await generateVibeCheck(defaultInput);

    expect(retrieveSimilarItineraryChunks).toHaveBeenCalledWith(
      defaultInput.itineraryText,
      15,
    );
    expect(supabase.from).toHaveBeenCalledWith('vibechecks');
    expect(mockSelect).toHaveBeenCalled();

    expect(chatModel.invoke).toHaveBeenCalled();
    expect(result).toBe('Hot sweat, hotter laksa moment');
  });

  it('falls back to zero-shot if example retrieval fails', async () => {
    retrieveSimilarItineraryChunks.mockRejectedValue(
      new Error('Vector DB down'),
    );

    chatModel.invoke.mockResolvedValue({
      content: 'Temple stairs unlocked my third eye',
    });

    const result = await generateVibeCheck(defaultInput);
    expect(result).toBe('Temple stairs unlocked my third eye');
  });

  it('returns fallback message if chatModel returns invalid content', async () => {
    retrieveSimilarItineraryChunks.mockResolvedValue([]);
    mockSelect.mockResolvedValue({ data: [], error: null });

    chatModel.invoke.mockResolvedValue({}); // no content

    const result = await generateVibeCheck(defaultInput);
    expect(result).toBe('Could not generate vibe check. Try again.');
  });

  it('throws an error if Gemini fails completely', async () => {
    retrieveSimilarItineraryChunks.mockResolvedValue([]);
    mockSelect.mockResolvedValue({ data: [], error: null });

    chatModel.invoke.mockRejectedValue(new Error('timeout'));

    await expect(generateVibeCheck(defaultInput)).rejects.toThrow(
      'Gemini generation failed: timeout',
    );
  });
});
