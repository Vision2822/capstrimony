// src/app/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route'; 

export default async function DashboardPage() {
  const session = await auth(); 

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Welcome, {session.user?.name}!</h1>
        <p className="mt-2 text-gray-600">PRN: {session.user?.prn}</p>
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            You're successfully logged in! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}