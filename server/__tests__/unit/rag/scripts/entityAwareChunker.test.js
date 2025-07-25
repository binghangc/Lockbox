jest.mock('../../../../utils/llmclient.js', () => ({
  invoke: jest.fn(() => Promise.resolve({ content: '["Zermatt"]' })),
}));

const enrichChunks = require('../../../../rag/scripts/entityAwareChunker.js');
const extractLocationNames = require('../../../../rag/scripts/extractLocationNames.js');
const classifyActivityTags = require('../../../../rag/scripts/classifyActivityTags.js');
const classifyLocationTags = require('../../../../rag/scripts/classifyLocationTags.js');

jest.mock('../../../../rag/scripts/extractLocationNames.js');
jest.mock('../../../../rag/scripts/classifyActivityTags.js');
jest.mock('../../../../rag/scripts/classifyLocationTags.js');

describe('enrichChunks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('enriches itinerary chunks with metadata', async () => {
    extractLocationNames.mockResolvedValue(['Zermatt']);
    classifyLocationTags.mockResolvedValue(['mountain']);
    classifyActivityTags.mockResolvedValue(['hiking']);

    const result = await enrichChunks(
      `Train to Zermatt and hike\n\n**Another chunk**`,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      chunk_text: 'Train to Zermatt and hike',
      location_name: ['Zermatt'],
      location_tag: ['mountain'],
      activity_tag: ['hiking'],
      embedding: null,
    });

    expect(result[1].chunk_text).toBe('Another chunk');
  });

  it('handles errors from classifiers gracefully', async () => {
    extractLocationNames.mockRejectedValueOnce(new Error('fail'));

    const result = await enrichChunks('Something bad happens');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      chunk_text: 'Something bad happens',
      location_name: [],
      location_tag: [],
      activity_tag: [],
      embedding: null,
    });
  });
});
