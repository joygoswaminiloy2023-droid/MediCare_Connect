'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/analytics');
  }, [router]);

  return (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#00A3E0] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}