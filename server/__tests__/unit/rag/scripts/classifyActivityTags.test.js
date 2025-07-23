jest.mock('../../../../utils/llmclient.js', () => ({
  invoke: jest.fn(),
}));

const classifyActivityTags = require('../../../../rag/scripts/classifyActivityTags.js');
const llmClient = require('../../../../utils/llmclient.js');

describe('classifyActivityTags', () => {
  it('parses valid JSON response from LLM', async () => {
    llmClient.invoke.mockResolvedValueOnce({
      content: `["hiking", "photography"]`,
    });

    const tags = await classifyActivityTags(
      'Hike to the viewpoint and take pictures',
    );
    expect(tags).toEqual(['hiking', 'photography']);
  });

  it('extracts JSON from inside a wrapped message', async () => {
    llmClient.invoke.mockResolvedValueOnce({
      content: `Here are the activities:\n["sightseeing", "cultural-tour"]\nEnjoy!`,
    });

    const tags = await classifyActivityTags(
      'Visit temples and admire old town',
    );
    expect(tags).toEqual(['sightseeing', 'cultural-tour']);
  });

  it('returns empty array for completely unparseable response', async () => {
    llmClient.invoke.mockResolvedValueOnce({
      content: `No idea what you're asking lol`,
    });

    const tags = await classifyActivityTags('???');
    expect(tags).toEqual([]);
  });
});
