import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const NextAuthOptions = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { password, email } = credentials;

        const { data: user } = await supabase
          .from('user_profiles')
          .select(
            'id, email, name, avatar_url, islevel2, highest_score, latest_score, total_games, total_score, lastplaytime'
          )
          .eq('email', email)
          .single();

        const { data: userCredentials } = await supabase
          .from('user_credentials')
          .select('password_hash')
          .eq('user_id', user.id)
          .single();

        const isValid = await bcrypt.compare(
          password,
          userCredentials.password_hash
        );
        if (!isValid) {
          console.log('Invalid password');
          return null;
        }

        console.log('Successful login for user:', user.email);

        const token = jwt.sign(
          {
            email: user.email,
            id: user.id,
          },
          process.env.NEXTAUTH_SECRET,
          { expiresIn: '3d' }
        );

        return {
          profileId: user.id,
          email: user.email,
          name: user.name || user.email, // 優先使用 name，如果沒有則使用 email
          avatar_url: user.avatar_url,
          islevel2: user.islevel2,
          highest_score: user.highest_score,
          latest_score: user.latest_score,
          total_games: user.total_games,
          total_score: user.total_score,
          lastplaytime: user.lastplaytime,
          token,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          redirect_uri: process.env.NEXTAUTH_URL
            ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
            : `https://${process.env.VERCEL_URL}/api/auth/callback/google`,
        },
      },
    }),
  ],

  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
    schema: 'next_auth',
  }),
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user, account }) => {
      const now = Math.floor(Date.now() / 1000);
      if (user) {
        // 統一處理 profileId：將 Google 登入的 id 轉換為 profileId
        const processedUser = {
          ...user,
          profileId: user.profileId || user.id, // 如果沒有 profileId，就使用 id
        };

        // 如果是 Google 登入，移除原本的 id 以避免混淆
        if (account?.provider === 'google' && !user.profileId) {
          delete processedUser.id;
        }

        token = {
          ...token,
          ...processedUser,
          iat: now,
          expjwt: now + 60 * 60 * 24 * 1,
        };
      }
      return token;
    },
    session: async ({ session, token }) => {
      // 確保 session 中只有 profileId，沒有 id（除非是其他用途的 id）
      const sessionData = { ...session, ...token };

      // 如果有 id 但沒有 profileId，將 id 重新命名為 profileId
      if (sessionData.id && !sessionData.profileId) {
        sessionData.profileId = sessionData.id;
        delete sessionData.id;
      }

      return sessionData;
    },
    async signIn({ user }) {
      return !!user;
    },
  },
});

export default function handler(...params) {
  return NextAuthOptions(...params);
}
