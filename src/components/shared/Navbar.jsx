'use client'
import React, { useState } from 'react';
import { FaHeartbeat, FaBars, FaTimes, FaRegCalendarCheck, FaUserCircle, FaChevronDown, FaUserAlt, FaSignOutAlt } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import { MdDashboardCustomize } from 'react-icons/md';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Mock authentication state toggle (Set to true to view the profile layout)
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* MAIN LOGO & CALL-TO-ACTION BAR */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex justify-between items-center relative">
        
        {/* Brand Identity */}
        <a href="./" className="flex items-center space-x-3 group">
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
        </a>

        {/* Action Buttons, Profile Layout & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4">
            <a 
              href="/dashboard/patient" 
              className="border-2 border-[#00A3E0] text-[#00A3E0] hover:bg-[#00A3E0] hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <FaRegCalendarCheck className="text-sm" />
              APPOINTMENT
            </a>

            {isLoggedIn ? (
              /* DESKTOP USER PROFILE DROPDOWN MENU TRIGGER */
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 bg-slate-50 border border-slate-200 hover:border-[#00A3E0] rounded-xl px-3 py-2 transition-all group"
                >
                  <div className="text-[#00A3E0] text-2xl group-hover:scale-105 transition-transform">
                    <FaUserCircle />
                  </div>
                  <div className="flex flex-col text-left text-xs">
                    <span className="font-bold text-slate-800 leading-none">John Doe</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Patient Account</span>
                  </div>
                  <FaChevronDown className={`text-[10px] text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN BOX */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
                    <a href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#e6f6fc] hover:text-[#00A3E0] transition-colors">
                      <MdDashboardCustomize className="text-sm" />
                      My Dashboard
                    </a>
                    <a href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#e6f6fc] hover:text-[#00A3E0] transition-colors">
                      <FaUserAlt className="text-xs" />
                      Account Settings
                    </a>
                    <hr className="my-1 border-slate-100" />
                    <button 
                      onClick={() => setIsLoggedIn(false)} 
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      <FaSignOutAlt className="text-xs" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsLoggedIn(true)}
                className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <FiLogIn className="text-sm" />
                LOGIN / REGISTER
              </button>
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
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <nav className="flex items-center space-x-1 text-sm text-slate-200 font-bold">
            <a href="./" className="bg-[#00A3E0] text-white px-5 py-4 transition-colors">HOME</a>
            <a href="/find-doctors" className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">FIND DOCTORS</a>
            <a href="/about-us" className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">ABOUT US</a>
            <a href="/contact-us" className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">CONTACT US</a>
            <a href="/dashboard" className="hover:bg-slate-800 hover:text-white px-5 py-4 transition-colors">DASHBOARD</a>
          </nav>
        </div>
      </div>

      {/* MOBILE DROPDOWN NAVIGATION MENU */}
      {isOpen && (
        <div className="lg:hidden bg-slate-950 text-white w-full border-t border-slate-800 animate-fadeIn">
          {isLoggedIn && (
            /* MOBILE USER PROFILE METADATA BANNER */
            <div className="bg-slate-900 px-6 py-4 flex items-center space-x-3 border-b border-slate-800">
              <div className="text-[#00A3E0] text-3xl">
                <FaUserCircle />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">John Doe</span>
                <span className="text-xs text-slate-400">john.doe@gmail.com</span>
              </div>
            </div>
          )}

          <nav className="flex flex-col text-sm font-bold divide-y divide-slate-800">
            <a href="./" className="px-6 py-4 bg-[#00A3E0] text-white">HOME</a>
            <a href="/find-doctors" className="px-6 py-4 hover:bg-slate-900 transition-colors">FIND DOCTORS</a>
            <a href="/about-us" className="px-6 py-4 hover:bg-slate-900 transition-colors">ABOUT US</a>
            <a href="/contact-us" className="px-6 py-4 hover:bg-slate-900 transition-colors">CONTACT US</a>
            <a href="/dashboard" className="px-6 py-4 hover:bg-slate-900 transition-colors">DASHBOARD</a>
          </nav>
          
          {/* Mobile Action Buttons & Authentication Switches */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="/dashboard/patient" 
                className="border-2 border-[#00A3E0] text-[#00A3E0] text-center hover:bg-[#00A3E0] hover:text-white py-3 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaRegCalendarCheck />
                APPOINTMENT
              </a>
              {isLoggedIn ? (
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaSignOutAlt />
                  LOGOUT
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoggedIn(true)}
                  className="bg-white text-slate-900 hover:bg-slate-100 py-3 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FiLogIn />
                  LOGIN
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}