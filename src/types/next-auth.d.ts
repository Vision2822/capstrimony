import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    prn: string;
    onboardingComplete: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      prn: string;
      onboardingComplete: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    prn: string;
    onboardingComplete: boolean;
  }
}