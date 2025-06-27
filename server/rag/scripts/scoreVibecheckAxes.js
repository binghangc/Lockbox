const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { AXES, AXIS_DESCRIPTIONS } = require('../constants/vibechecks.js');

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash-lite',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

async function scoreVibecheckAxes(vibecheckText) {
  const axisPrompt = AXES.map(
    (axis) => `"${axis}": ${AXIS_DESCRIPTIONS[axis]}`,
  ).join('\n');

  const prompt = `
Score the following vibecheck along the defined axes. Return a JSON object where each key is a float between 0 and 1.

${axisPrompt}

Vibecheck: """
${vibecheckText}
"""

Return JSON only:
`;

  const response = await llm.invoke([['human', prompt]]);
  const raw = response.content;

  try {
    return JSON.parse(raw);
  } catch (err) {
    const match = raw.match(/\{[\s\S]*?\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        console.warn('[scoreVibecheckAxes]', 'Failed to parse score JSON');
      }
    }
    throw new Error('[scoreVibecheckAxes] Failed to parse score JSON:', err);
  }
}

module.exports = scoreVibecheckAxes;
