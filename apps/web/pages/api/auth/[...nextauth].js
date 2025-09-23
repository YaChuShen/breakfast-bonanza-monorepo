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
            'id, email, avatar_url, islevel2, highest_score, latest_score, total_games, total_score, lastplaytime'
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
          name: user.email, // 使用 email 作為 name，因為資料庫沒有單獨的 name 字段
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
    jwt: async ({ token, user }) => {
      const now = Math.floor(Date.now() / 1000);
      if (user) {
        token = {
          ...token,
          ...user,
          iat: now,
          expjwt: now + 60 * 60 * 24 * 1,
        };
      }
      return token;
    },
    session: async ({ session, token }) => {
      return { ...session, ...token };
    },
    async signIn({ user }) {
      return !!user;
    },
  },
});

export default function handler(...params) {
  return NextAuthOptions(...params);
}
