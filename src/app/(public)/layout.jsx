import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import React from 'react';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}