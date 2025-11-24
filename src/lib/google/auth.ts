import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: [
            'openid',
            'profile',
            'email',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/calendar.events'
          ].join(' ')
        },
      },
    }),
  ],
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // After successful Google login, always redirect to kurulum (setup) page
      return `${baseUrl}/kurulum`;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export default authOptions;
