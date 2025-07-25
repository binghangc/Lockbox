jest.mock('../../../../../rag/utils/embeddingClient.js', () => ({
  embedText: jest.fn(() => [0.1, 0.2, 0.3]),
}));

jest.mock('../../../../../rag/scripts/vibechecks/classifyTheme.js', () =>
  jest.fn(() => 'funny'),
);

jest.mock('../../../../../utils/supabaseAdminClient.js', () => {
  const insert = jest.fn();
  const from = jest.fn(() => ({ insert }));

  return {
    from,
    __mocks: { from, insert }, // expose safely for test access
  };
});

const { embedText } = require('../../../../../rag/utils/embeddingClient.js');
const classifyTheme = require('../../../../../rag/scripts/vibechecks/classifyTheme.js');
const supabase = require('../../../../../utils/supabaseAdminClient.js');
const { __mocks } = require('../../../../../utils/supabaseAdminClient.js');
const embedVibecheck = require('../../../../../rag/scripts/vibechecks/embedVibecheck.js');

describe('embedVibecheck', () => {
  it('embeds and inserts vibecheck without error', async () => {
    const input = {
      vibecheck_id: 'abc123',
      user_id: 'user1',
      trip_id: 'trip1',
      vibecheck_text: 'We got lost but found snacks',
    };

    __mocks.insert.mockResolvedValueOnce({ error: null });

    await embedVibecheck(input);

    expect(classifyTheme).toHaveBeenCalledWith(input.vibecheck_text);
    expect(embedText).toHaveBeenCalledWith(input.vibecheck_text);

    expect(supabase.from).toHaveBeenCalledWith('vibecheck_embeddings');
    expect(__mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        vibecheck_id: input.vibecheck_id,
        theme: 'funny',
        embedding: [0.1, 0.2, 0.3],
      }),
    );
  });

  it('throws if supabase insert fails', async () => {
    __mocks.insert.mockResolvedValueOnce({
      error: new Error('insert failed'),
    });

    await expect(
      embedVibecheck({
        vibecheck_id: 'fail123',
        user_id: 'user2',
        trip_id: 'trip2',
        vibecheck_text: 'Oops',
      }),
    ).rejects.toThrow('insert failed');
  });
});
