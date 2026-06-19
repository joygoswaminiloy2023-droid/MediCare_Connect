'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaStar, FaCheckCircle } from 'react-icons/fa';

export default function FeaturedDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State Engine
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/doctors/profile");
        if (!res.ok) throw new Error("Network routing collection response failed.");
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      } catch (err) {
        console.error("Database fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Calculate Pagination Slices
  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination Helper: Generates page numbers with ellipsis counters block
  const getPaginationPageNumbers = () => {
    const pages = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page === '...') return;
    setCurrentPage(page);
    // Smooth scroll back to section boundary head on page change execution
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="inline-block bg-[#e6f6fc] text-[#00A3E0] text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
              Top Rated
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Featured Specialists
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Hand-picked experts with exceptional patient satisfaction.
            </p>
          </div>
          <a 
            href="/find-doctors" 
            className="text-xs font-bold text-[#00A3E0] hover:text-[#0082b3] transition-colors flex items-center gap-1 whitespace-nowrap self-start sm:self-end mb-1"
          >
            View All Doctors <span className="text-sm font-normal">&rsaquo;</span>
          </a>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 h-[420px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* DYNAMIC CARDS CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {currentDoctors.map((doc) => (
                <div 
                  key={doc._id || doc.id} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden"
                >
                  {/* CARD VISUAL LAYER */}
                  <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                    <Image 
                     
                      src={doc.image || doc.profileImage || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop"} 
                      alt={doc.doctorName || doc.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover object-top" 
                    />
                    
                    {/* FLOATING VERIFIED STATUS BADGE */}
                    <div className="absolute top-4 right-4 bg-[#02a984] text-white flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      <FaCheckCircle className="text-[11px]" /> Verified
                    </div>

                    {/* FLOATING RATING BADGE */}
                    <div className="absolute bottom-4 left-4 bg-white text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-md">
                      <FaStar className="text-amber-400 text-xs" /> 
                      <span>{doc.rating || "4.9"}</span>
                      <span className="text-slate-400 font-medium text-[11px]">({doc.reviews || "124"})</span>
                    </div>
                  </div>

                  {/* CARD CONTENT LAYER */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                        {doc.doctorName || doc.name}
                      </h3>
                      
                      {/* METADATA STRIP */}
                      <div className="flex items-center space-x-2 mt-2 text-xs font-semibold">
                        <span className="text-[#00A3E0]">{doc.specialization || doc.spec}</span>
                        <span className="text-slate-300 font-normal">&bull;</span>
                        <span className="text-slate-400 font-medium">{doc.experience || doc.exp} yrs</span>
                      </div>
                    </div>

                    {/* BOTTOM ACTION BAR */}
                    <div className="flex items-center justify-between mt-6 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                          Consultation
                        </span>
                        <span className="text-xl font-extrabold text-slate-900 mt-1">
                          ${doc.consultationFee || doc.fee}
                        </span>
                      </div>

                      <a 
                        href={`/appointments/book/${doc._id || doc.id}`}
                        className="bg-[#00A3E0] hover:bg-[#0878a1] text-white font-bold text-xs tracking-wide px-5 py-3 rounded-xl shadow-sm transition-colors duration-200"
                      >
                        Book Now
                      </a>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* PAGINATION INTERACTIVE CONTROL DOCK */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12 pt-6 border-t border-slate-100">
                {/* Prev Button Element */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage === 1
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Prev
                </button>

                {/* Number Loop Matrix */}
                {getPaginationPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      page === '...'
                        ? 'text-slate-400 cursor-default'
                        : currentPage === page
                        ? 'bg-[#00A3E0] text-white shadow-sm'
                        : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button Element */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage === totalPages
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}