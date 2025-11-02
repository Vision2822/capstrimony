import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch user data to check onboarding status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      onboardingComplete: true,
      profileCompletion: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="mt-2 text-gray-600">PRN: {session.user.prn}</p>
        
        <div className="mt-8 grid gap-6">
          {/* Profile Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm text-gray-500">{user.profileCompletion}%</span>
                  </div>
                  <Progress value={user.profileCompletion} className="h-2" />
                </div>
                
                {!user.onboardingComplete && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      Complete your profile to start finding teammates!
                    </p>
                    <Link href="/onboarding">
                      <Button size="sm">Complete Profile</Button>
                    </Link>
                  </div>
                )}
                
                {user.onboardingComplete && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Your profile is complete! You can start matching with teammates.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
                <Button disabled className="w-full">
                  Find Teammates (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}