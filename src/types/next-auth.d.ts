import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    prn: string;
    onboardingComplete: boolean;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      prn: string;
      onboardingComplete: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    prn?: string;
    onboardingComplete?: boolean;
  }
}