const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

function createEmbeddingsClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');

  return new GoogleGenerativeAIEmbeddings({
    modelName: 'models/embedding-001',
    apiKey,
    taskType: 'CLUSTERING',
  });
}

async function embedText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error(`Invalid text for embedding: ${text}`);
  }

  const client = createEmbeddingsClient();
  return client.embedQuery(text);
}

async function embedTexts(texts) {
  const client = createEmbeddingsClient();
  return client.embedDocuments(texts);
}

module.exports = {
  createEmbeddingsClient,
  embedText,
  embedTexts,
};
