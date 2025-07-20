function mockQueue(name) {
  return {
    name,
    add: async (jobName, payload) => {
      console.log(`[MockQueue:${name}] add job "${jobName}"`, payload);
      return Promise.resolve({ id: `${jobName}-mock-id` });
    },
    on: () => {}, // No-op for event listeners
  };
}

module.exports = {
  mockQueue,
};
