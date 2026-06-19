'use client'
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHeartbeat, FaBars, FaTimes, FaRegCalendarCheck, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { FiLogIn, FiLogOut, FiLayout, FiSettings } from 'react-icons/fi';

// Import your authClient instance
import { authClient } from "@/lib/auth-client";
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Read active authentication state directly from your auth client hook
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user || null;

  // Helper method to dynamically direct users to their specific authorized control layout
  const getDashboardRoute = () => {
    if (!user) return "/Authentication_pages";
    
    const role = user.role; // Captures 'doctor', 'patient', or 'admin'
    if (role === "doctor") {
      return "/dashboard/doctor/profile";
    } else if (role === "admin") {
      return "/dashboard/admin";
    } else {
      return "/dashboard/patient"; // Fallback target route path for standard patients
    }
  };

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        callbackURL: "/Authentication_pages" // Redirects to your login page upon successful logout
      });
      setDropdownOpen(false);
      setIsOpen(false);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  console.log(user)
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50 font-sans">
      {/* MAIN LOGO & CALL-TO-ACTION BAR */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        
        {/* Brand Identity */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-[#00A3E0] text-white p-2.5 rounded-xl shadow-md group-hover:bg-[#0082b3] transition-colors flex items-center justify-center">
            <FaHeartbeat className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-800 leading-none">
              MediCare <span className="text-[#00A3E0]">Connect</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
              An Intuitive Health Care
            </span>
          </div>
        </Link>

        {/* Action Buttons & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="/dashboard/patient" 
              className="border-2 border-[#00A3E0] text-[#00A3E0] hover:bg-[#00A3E0] hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <FaRegCalendarCheck className="text-sm" />
              APPOINTMENT
            </Link>

            {/* Loading Skeleton state fallback to keep UI smooth while parsing token cookies */}
            {isPending ? (
              <div className="w-32 h-9 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-all text-slate-700 outline-none"
                >
                  {user.image ? (
                    <Image src={user.image} alt={user.name} width={40} height={40} className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <FaUserCircle className="text-2xl text-slate-400" />
                  )}
                  <span className="text-xs font-bold max-w-[120px] truncate">{user.name}</span>
                  <FaChevronDown className={`text-[10px] text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 text-slate-700 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    {/* IMPLEMENTED: Dynamic context calculation inside user tracking dropdown menu view link structure */}
                    <Link href={getDashboardRoute()} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <FiLayout className="text-sm text-slate-400" /> Dashboard
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <FiSettings className="text-sm text-slate-400" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full border-t border-slate-100 mt-1 flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left">
                      <FiLogOut className="text-sm" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/Authentication_pages" className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-200 flex items-center gap-2">
                <FiLogIn className="text-sm" />
                LOGIN / REGISTER
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-slate-700 hover:text-[#00A3E0] p-2 focus:outline-none transition-colors"
          >
            {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* DESKTOP SOLID NAV BAR */}
      <div className="hidden lg:block w-full bg-slate-900 px-6">
        <div className="max-w-7xl mx-auto flex justify-start items-center">
          <nav className="flex items-center space-x-1 text-sm text-slate-200 font-bold">
            <Link href="/" className="bg-[#00A3E0] text-white px-5 py-4 transition-colors">HOME</Link>
            <Link href="/find-doctors" className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">FIND DOCTORS</Link>
            <Link href="/about-us" className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">ABOUT US</Link>
            <Link href="/contact-us" className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">CONTACT US</Link>
            {/* IMPLEMENTED: Updated desktop nav layout element link tracking endpoint logic */}
            <Link href={getDashboardRoute()} className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">DASHBOARD</Link>
          </nav>
        </div>
      </div>

      {/* MOBILE DROPDOWN NAVIGATION MENU */}
      {isOpen && (
        <div className="lg:hidden bg-slate-950 text-white w-full border-t border-slate-800 animate-fadeIn">
          {/* Mobile User Header Context Card */}
          {!isPending && user && (
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-900/60 border-b border-slate-800">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <FaUserCircle className="text-3xl text-slate-500" />
              )}
              <div>
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col text-sm font-bold divide-y divide-slate-800">
            <Link href="/" onClick={() => setIsOpen(false)} className="px-6 py-4 bg-[#00A3E0] text-white">HOME</Link>
            <Link href="/find-doctors" onClick={() => setIsOpen(false)} className="px-6 py-4 hover:bg-slate-900 transition-colors">FIND DOCTORS</Link>
            <Link href="/about-us" onClick={() => setIsOpen(false)} className="px-6 py-4 hover:bg-slate-900 transition-colors">ABOUT US</Link>
            <Link href="/contact-us" onClick={() => setIsOpen(false)} className="px-6 py-4 hover:bg-slate-900 transition-colors">CONTACT US</Link>
            {/* IMPLEMENTED: Updated dynamic responsive layout link route processing targeting parameter element */}
            <Link href={getDashboardRoute()} onClick={() => setIsOpen(false)} className="px-6 py-4 hover:bg-slate-900 transition-colors">DASHBOARD</Link>
          </nav>
          
          {/* Mobile Action buttons */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/dashboard/patient" 
                onClick={() => setIsOpen(false)}
                className="border-2 border-[#00A3E0] text-[#00A3E0] text-center hover:bg-[#00A3E0] hover:text-white py-3 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaRegCalendarCheck />
                APPOINTMENT
              </Link>
              
              {!isPending && user ? (
                <button onClick={handleLogout} className="bg-rose-600 text-white hover:bg-rose-700 py-3 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                  <FiLogOut />
                  LOGOUT
                </button>
              ) : (
                <Link href="/Authentication_pages" onClick={() => setIsOpen(false)} className="bg-white text-slate-900 hover:bg-slate-100 py-3 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                  <FiLogIn />
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}