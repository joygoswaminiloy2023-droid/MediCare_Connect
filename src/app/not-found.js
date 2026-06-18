"use client"
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white text-center px-4">
      
      {/* MEDICAL CROSS VISUAL MARK */}
      <div className="mb-8">
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          
          {/* Centered Medical Cross */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="w-8 h-24 bg-[#00A3E0] rounded-md absolute"></div>
            <div className="w-24 h-8 bg-[#00A3E0] rounded-md absolute"></div>
          </div>

          {/* Pulse Layer Ring */}
          <span className="absolute inset-0 rounded-full border-4 border-[#00A3E0] animate-ping opacity-40 pointer-events-none"></span>
        </div>
      </div>

      {/* TYPOGRAPHY ELEMENTS */}
      <h1 className="text-7xl font-black text-[#00A3E0] tracking-tight">404</h1>

      <h2 className="text-2xl md:text-3xl font-bold mt-4 text-slate-100">
        Page Not Found
      </h2>

      <p className="mt-2 text-slate-400 max-w-md text-sm font-medium">
        Oops! This page is missing… like a heartbeat out of rhythm.
      </p>

      {/* CTA ROUTE ACTION LINK */}
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-[#00A3E0] hover:bg-[#0082b3] text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-[#00A3E0]/20 transition-all"
      >
        Go Back Home
      </Link>

      {/* TAILWIND PULSING HEARTBEAT LINE TRACKER */}
      <div className="mt-12 w-full max-w-xs overflow-hidden">
        <div className="h-1 bg-slate-800 rounded-full relative overflow-hidden">
          <div className="absolute h-full w-1/3 bg-[#00A3E0] rounded-full animate-pulse"></div>
        </div>
      </div>

    </div>
  );
}