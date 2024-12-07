export const authConfig = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session: () => ({
      user: {
        id: 'cl1234567890',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://github.com/shadcn.png',
      },
      expires: '2025-01-01',
    }),
  },
}
