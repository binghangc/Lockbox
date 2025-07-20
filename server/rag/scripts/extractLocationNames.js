const llmClient = require('../../utils/llmclient.js');

async function extractLocationNames(text) {
  const prompt = `Extract only the **main place names** from the text below. 
Only include proper names of cities, neighborhoods, malls, landmarks, or attractions.
Return as a **JSON array** of strings. No explanation.

Text: """${text}"""
`;
  const response = await llmClient.invoke([['human', prompt]]);
  const raw = response.content;
  try {
    return JSON.parse(raw);
  } catch {
    // Try to salvage from code block or bullet list
    const match = raw.match(/\[.*?\]/s); // look for JSON array
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }

    // As last resort, split by bullet points or newlines
    return raw
      .split(/\n|•|-/)
      .map((line) => line.trim().replace(/^["'*`]+|["'*`]+$/g, ''))
      .filter((line) => line.length > 1 && /^[A-Z]/.test(line)); // crude check: capitalized
  }
}

module.exports = extractLocationNames;
