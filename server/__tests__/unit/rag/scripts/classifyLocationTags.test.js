jest.mock('../../../../rag/scripts/classifyLocationType.js', () => jest.fn());

const classifyLocationTags = require('../../../../rag/scripts/classifyLocationTags.js');
const classifyLocationType = require('../../../../rag/scripts/classifyLocationType.js');

describe('classifyLocationTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('classifies all location names successfully', async () => {
    classifyLocationType
      .mockResolvedValueOnce('mountain')
      .mockResolvedValueOnce('city');

    const tags = await classifyLocationTags(['Zermatt', 'Geneva']);
    expect(tags).toEqual(['mountain', 'city']);
    expect(classifyLocationType).toHaveBeenCalledTimes(2);
  });

  it('skips and warns on classification failure', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    classifyLocationType
      .mockResolvedValueOnce('lake')
      .mockRejectedValueOnce(new Error('LLM broke'));

    const tags = await classifyLocationTags(['Oeschinensee', '??']);
    expect(tags).toEqual(['lake']);
    expect(consoleSpy).toHaveBeenCalledWith(
      `[classifyLocationTags] Failed to classify "??":`,
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('returns an empty array when all fail', async () => {
    classifyLocationType.mockRejectedValue(new Error('fail'));

    const tags = await classifyLocationTags(['???', '!!!']);
    expect(tags).toEqual([]);
  });

  it('returns an empty array when input is empty', async () => {
    const tags = await classifyLocationTags([]);
    expect(tags).toEqual([]);
    expect(classifyLocationType).not.toHaveBeenCalled();
  });
});
