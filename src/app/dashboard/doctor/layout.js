"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarClock, 
  FileCheck2, 
  ClipboardSignature, 
  UserCog, 
  Home,
  HeartPulse,
  Menu,
  X
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';
// Import your authClient instance
import { authClient } from "@/lib/auth-client";

export default function DoctorDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Read active session credentials directly from your hook context
  const { data: session, isPending } = authClient.useSession();

  // IMPLEMENTED: Route Guard Security Firewall Execution Block
  useEffect(() => {
    if (isPending) return;

    // Rule 1: No active authentication state -> boot back to login entry screen
    if (!session?.user) {
      router.push("/Authentication_pages");
      return;
    }

    // Rule 2: Explicit role mismatch -> prevent patients or admins from seeing doctor tools
    if (session.user.role !== "doctor") {
      router.push("/"); // Safely bounce non-doctors to public index landing root
    }
  }, [session, isPending, router]);

  const navigationOptions = [
    { name: 'Dashboard Overview', href: '/dashboard/doctor', icon: LayoutDashboard },
    { name: 'Manage Schedule', href: '/dashboard/doctor/schedule', icon: CalendarClock },
    { name: 'Appointment Requests', href: '/dashboard/doctor/appointments', icon: FileCheck2 },
    { name: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: ClipboardSignature },
    { name: 'Profile Settings', href: '/dashboard/doctor/profile', icon: UserCog },
  ];

  // Render a clean verifying overlay block while auth token cookies are being parsed
  if (isPending || !session?.user || session.user.role !== "doctor") {
    return (
      <div className="h-screen w-full bg-slate-900 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#00A3E0] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Verifying Medical Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    // Changed min-h-screen to h-screen on desktop viewports to prevent layout overflow tracking issues
    <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden relative">
      
      {/* --- MOBILE TOP HEADER --- */}
      <div className="w-full bg-slate-900 text-white p-4 flex md:hidden items-center justify-between shadow-md sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#00A3E0] p-1.5 rounded-lg text-white">
            <HeartPulse size={16} className="animate-pulse" />
          </div>
          <span className="font-black tracking-tight text-xs uppercase">MediCare</span>
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none bg-slate-800 rounded-xl"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* --- DARK BACKGROUND OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SLIDE-OUT SIDEBAR DRAWER --- */}
      {/* FIXED TAILWIND FIX: Added md:h-screen to guarantee 100% full height coverage on desktop grids */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 border-r border-slate-800 z-50 transition-transform duration-300 ease-in-out
        md:sticky md:h-screen md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Sidebar Header Container */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#00A3E0] p-2 rounded-xl text-white">
              <HeartPulse size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-sm uppercase leading-none">MediCare</h1>
              <span className="text-[10px] font-bold tracking-widest text-[#00A3E0]">DOCTOR PORTAL</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Option Items Wrapper */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navigationOptions.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Portal Exit Action Block */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex-shrink-0">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <Home size={14} /> EXIT TO MAIN SITE
          </Link>
        </div>
      </aside>

      {/* --- DASHBOARD WORKSPACE MAIN BODY --- */}
      {/* Added md:overflow-y-auto to allow the main panel content to scroll independently while the sidebar stays frozen */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto  w-full h-full">
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </main>
    </div>
  );
}