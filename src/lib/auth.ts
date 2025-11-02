import NextAuth from 'next-auth';
import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AdapterUser } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { authenticateWithPESU } from '@/lib/pesu-scraper';
import { Department, Campus } from '@prisma/client';

const DEPARTMENT_MAP: Record<string, Department> = {
  'Computer Science and Engineering': Department.CSE,
  'CSE': Department.CSE,
  'Electronics and Communication Engineering': Department.ECE,
  'ECE': Department.ECE,
  'Electrical and Electronics Engineering': Department.EEE,
  'EEE': Department.EEE,
  'Mechanical Engineering': Department.ME,
  'ME': Department.ME,
  'Civil Engineering': Department.CE,
  'CE': Department.CE,
  'Biotechnology': Department.BT,
  'BT': Department.BT,
  'Artificial Intelligence and Machine Learning': Department.AIML,
  'AIML': Department.AIML,
  'Data Science': Department.DS,
  'DS': Department.DS,
};

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  prn: string;
  onboardingComplete: boolean;
}

interface SessionUpdate {
  onboardingComplete?: boolean;
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'PESU Academy',
      credentials: {
        username: { label: 'PESU PRN', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        console.log(`Login attempt: ${credentials.username}`);
        
        const result = await authenticateWithPESU(
          credentials.username as string,
          credentials.password as string
        );

        if (!result.success || !result.profile) {
          console.error('Auth failed:', result.error);
          return null;
        }

        const profile = result.profile;
        console.log('Auth successful:', profile.prn);

        const department =
          DEPARTMENT_MAP[profile.branch] ||
          DEPARTMENT_MAP[profile.branch?.toUpperCase()] ||
          Department.CSE;

        const campus = profile.campusCode === 1 ? Campus.RR : Campus.EC;

        const user = await prisma.user.upsert({
          where: { prn: profile.prn },
          update: {
            name: profile.name,
            email: profile.email,
            semester: parseInt(profile.semester) || 1,
            section: profile.section,
            phone: profile.phone,
            branch: profile.branch,
            program: profile.program,
            campus,
            campusCode: profile.campusCode,
            profilePicUrl: profile.photo,
            lastSyncedAt: new Date(),
            lastActiveAt: new Date(),
          },
          create: {
            prn: profile.prn,
            srn: profile.srn,
            name: profile.name,
            email: profile.email,
            department,
            branch: profile.branch,
            semester: parseInt(profile.semester) || 1,
            section: profile.section,
            program: profile.program,
            campus,
            campusCode: profile.campusCode,
            phone: profile.phone,
            profilePicUrl: profile.photo,
          },
        });

        console.log('User created/updated:', user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          prn: user.prn,
          onboardingComplete: user.onboardingComplete,
        } as ExtendedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ 
      token, 
      user, 
      trigger, 
      session 
    }: {
      token: JWT;
      user?: User | AdapterUser;
      trigger?: "update" | "signIn" | "signUp";
      session?: SessionUpdate;
    }) {
      // Only on initial sign in
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.prn = extendedUser.prn;
        token.name = extendedUser.name;
        token.email = extendedUser.email;
        token.onboardingComplete = extendedUser.onboardingComplete;
      }
      
      // Handle session updates
      if (trigger === "update" && session?.onboardingComplete !== undefined) {
        token.onboardingComplete = session.onboardingComplete;
      }
      
      return token;
    },
    async session({ 
      session, 
      token 
    }: { 
      session: Session; 
      token: JWT;
    }) {
      if (session.user) {
        const extendedSession = session as Session & {
          user: {
            id: string;
            prn: string;
            onboardingComplete: boolean;
          };
        };
        extendedSession.user.id = token.id as string;
        extendedSession.user.prn = token.prn as string;
        extendedSession.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});