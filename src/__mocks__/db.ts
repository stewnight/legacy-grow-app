export const db = {
  query: async () => [],
  transaction: async () => ({
    query: async () => [],
    commit: async () => {},
    rollback: async () => {},
  }),
}
