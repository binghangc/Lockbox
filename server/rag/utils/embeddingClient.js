const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: 'models/embedding-001',
  apiKey: process.env.GEMINI_API_KEY,
  taskType: 'CLUSTERING',
});

async function embedText(text) {
  return embeddings.embedQuery(text); // returns an array of floats
}

async function embedTexts(texts) {
  return embeddings.embedDocuments(texts); // returns array of arrays
}

module.exports = {
  embedText,
  embedTexts,
};
