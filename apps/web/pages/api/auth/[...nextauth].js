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
        const { password, email } = credentials;

        // 查詢用戶
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user) return { error: 'no user' };

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return { error: 'password error' };
        }

        console.log('Successful login');
        delete user.password;

        const token = jwt.sign(
          {
            email: user.email,
            id: user.id,
          },
          process.env.NEXTAUTH_SECRET,
          { expiresIn: '3d' }
        );

        return {
          ...user,
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
      if (user?.error === 'password error') {
        throw new Error(
          'The password you entered is incorrect. Please try again.'
        );
      }
      if (user?.error === 'no user') {
        throw new Error(
          'No account found with that email. Please check your email or register.'
        );
      }
      return true;
    },
  },
});

export default async function handler(...params) {
  await NextAuthOptions(...params);
}
