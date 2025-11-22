import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
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
      // Successful login sonrası dashboard'a yönlendir
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // External URL'e gitmeye çalışırsa ana sayfaya yönlendir
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export default authOptions;
