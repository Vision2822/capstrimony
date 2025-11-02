import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PROFILE_COMPLETION_WEIGHTS = {
  BASE: 25,
  BIO: 10,
  SKILLS: 15,
  DOMAINS: 10,
  PREFERRED_ROLES: 10,
  HOURS_PER_WEEK: 10,
  WORKING_STYLE: 5,
  SOCIAL_LINKS: 10,
  TEAM_SIZE: 5,
} as const;

const COMPLETION_THRESHOLD = 60;

const OnboardingSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.enum([
    'JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'JAVA', 'CPP',
    'REACT', 'NEXTJS', 'NODEJS', 'FLUTTER', 'REACT_NATIVE',
    'SQL', 'MONGODB', 'POSTGRESQL', 'AWS', 'DOCKER',
    'MACHINE_LEARNING', 'DEEP_LEARNING', 'UI_UX', 'FIGMA'
  ])).optional(),
  domains: z.array(z.enum([
    'WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'AI_ML', 'DATA_SCIENCE',
    'BLOCKCHAIN', 'IOT', 'CYBERSECURITY', 'CLOUD_COMPUTING', 'DEVOPS'
  ])).optional(),
  preferredRoles: z.array(z.enum([
    'FRONTEND_DEVELOPER', 'BACKEND_DEVELOPER', 'FULL_STACK_DEVELOPER',
    'MOBILE_DEVELOPER', 'UI_UX_DESIGNER', 'DATA_SCIENTIST',
    'ML_ENGINEER', 'PROJECT_MANAGER'
  ])).optional(),
  preferredTeamSize: z.number().min(2).max(6).optional(),
  hoursPerWeek: z.number().min(5).max(40).optional(),
  workingStyle: z.enum(['REMOTE', 'IN_PERSON', 'HYBRID']).optional(),
  willingToLead: z.boolean().optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  linkedinUrl: z.string().url().or(z.literal('')).optional(),
  portfolioUrl: z.string().url().or(z.literal('')).optional(),
  tools: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

type OnboardingData = z.infer<typeof OnboardingSchema>;

function calculateProfileCompletion(data: OnboardingData): number {
  let score = PROFILE_COMPLETION_WEIGHTS.BASE;

  if (data.bio) score += PROFILE_COMPLETION_WEIGHTS.BIO;
  if (data.skills?.length) score += PROFILE_COMPLETION_WEIGHTS.SKILLS;
  if (data.domains?.length) score += PROFILE_COMPLETION_WEIGHTS.DOMAINS;
  if (data.preferredRoles?.length) score += PROFILE_COMPLETION_WEIGHTS.PREFERRED_ROLES;
  if (data.hoursPerWeek) score += PROFILE_COMPLETION_WEIGHTS.HOURS_PER_WEEK;
  if (data.workingStyle) score += PROFILE_COMPLETION_WEIGHTS.WORKING_STYLE;
  if (data.githubUrl || data.linkedinUrl) score += PROFILE_COMPLETION_WEIGHTS.SOCIAL_LINKS;
  if (data.preferredTeamSize) score += PROFILE_COMPLETION_WEIGHTS.TEAM_SIZE;

  return score;
}

function cleanData<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  ) as Partial<T>;
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = OnboardingSchema.parse(body);
    const completionScore = calculateProfileCompletion(validatedData);
    const dataToUpdate = cleanData(validatedData);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...dataToUpdate,
        profileCompletion: completionScore,
        onboardingComplete: completionScore >= COMPLETION_THRESHOLD,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profileCompletion: completionScore,
      onboardingComplete: updatedUser.onboardingComplete,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        bio: true,
        skills: true,
        domains: true,
        preferredRoles: true,
        preferredTeamSize: true,
        hoursPerWeek: true,
        workingStyle: true,
        willingToLead: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        tools: true,
        languages: true,
        profileCompletion: true,
        onboardingComplete: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sanitizedUser = {
      ...user,
      bio: user.bio ?? '',
      githubUrl: user.githubUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      portfolioUrl: user.portfolioUrl ?? '',
      skills: user.skills ?? [],
      domains: user.domains ?? [],
      preferredRoles: user.preferredRoles ?? [],
      tools: user.tools ?? [],
      languages: user.languages ?? [],
      hoursPerWeek: user.hoursPerWeek ?? 10,
      preferredTeamSize: user.preferredTeamSize ?? 4,
      willingToLead: user.willingToLead ?? false,
    };

    return NextResponse.json(sanitizedUser);
  } catch (error) {
    console.error('Get onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}