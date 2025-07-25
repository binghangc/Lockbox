jest.mock('../../../../utils/llmclient.js', () => ({
  invoke: jest.fn(),
}));

const llmClient = require('../../../../utils/llmclient.js');
const extractLocationNames = require('../../../../rag/scripts/extractLocationNames.js');

describe('extractLocationNames', () => {
  it('parses valid JSON array', async () => {
    llmClient.invoke.mockResolvedValue({
      content: '["Zermatt", "Matterhorn"]',
    });
    const result = await extractLocationNames(
      'Explore Zermatt and hike the Matterhorn',
    );
    expect(result).toEqual(['Zermatt', 'Matterhorn']);
  });

  it('handles embedded JSON in messy response', async () => {
    llmClient.invoke.mockResolvedValue({
      content: 'You might consider:\n["Zermatt", "Glacier Express"]',
    });
    const result = await extractLocationNames('Zermatt trip plan');
    expect(result).toEqual(['Zermatt', 'Glacier Express']);
  });

  it('falls back to bullet points if no JSON', async () => {
    llmClient.invoke.mockResolvedValue({
      content: '• Zermatt\n• Gornergrat\n• Glacier Paradise',
    });
    const result = await extractLocationNames('random text');
    expect(result).toEqual(['Zermatt', 'Gornergrat', 'Glacier Paradise']);
  });

  it('returns empty array if unparseable', async () => {
    llmClient.invoke.mockResolvedValue({ content: 'nope not today' });
    const result = await extractLocationNames('messy');
    expect(result).toEqual([]);
  });
});
