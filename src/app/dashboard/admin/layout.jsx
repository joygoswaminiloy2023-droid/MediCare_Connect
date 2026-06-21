'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, BarChart3, Calendar, CreditCard, UserCheck2, Home, HeartPulse, Menu, X, Settings, LogOut 
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import { authClient } from "@/lib/auth-client";
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && (!session?.user || session.user.role !== "admin")) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const navigationOptions = [
    { id: 'analytics', name: 'Dashboard Analytics', icon: BarChart3, href: '/dashboard/admin/analytics' },
    { id: 'users', name: 'Manage Users', icon: Users, href: '/dashboard/admin/users' },
    { id: 'doctors', name: 'Manage Doctors', icon: UserCheck2, href: '/dashboard/admin/doctors' },
    { id: 'appointments', name: 'Manage Appointments', icon: Calendar, href: '/dashboard/admin/appointments' },
    { id: 'payments', name: 'Payment Control', icon: CreditCard, href: '/dashboard/admin/payments' },
  ];

  if (isPending) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#00A3E0] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase animate-pulse">Initializing Secure Gateway...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed md:relative z-50 h-full w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-[#00A3E0] p-2 rounded-xl"><HeartPulse size={20} /></div>
          <div>
            <h1 className="font-black text-sm uppercase">MediCare</h1>
            <p className="text-[9px] text-[#00A3E0] font-bold tracking-widest">ADMIN PORTAL</p>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navigationOptions.map((item) => (
            <Link key={item.id} href={item.href} onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${pathname.includes(item.id) ? 'bg-[#00A3E0] shadow-lg shadow-[#00A3E0]/20' : 'text-slate-400 hover:bg-slate-800'}`}>
              <item.icon size={16} /> {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white py-2 text-xs font-bold">
            <Home size={14} /> EXIT TO MAIN SITE
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6">
          <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {pathname.split('/').pop()} Session
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </div>
        <ToastContainer position="bottom-right" />
      </main>
    </div>
  );
}