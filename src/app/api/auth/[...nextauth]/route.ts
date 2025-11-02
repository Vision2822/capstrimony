import NextAuth from 'next-auth';
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

export const {
  handlers: { GET, POST },
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.prn = user.prn;
        token.name = user.name;
        token.email = user.email;
        token.onboardingComplete = user.onboardingComplete;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.prn = token.prn;
      session.user.onboardingComplete = token.onboardingComplete;
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