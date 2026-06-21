'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaStar, FaCheckCircle, FaStethoscope, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// ── Animation Variants ────────────────────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-64 bg-slate-100" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="flex justify-between items-center mt-6">
          <div className="h-6 bg-slate-100 rounded w-24" />
          <div className="h-10 bg-slate-100 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

// ── Doctor Card ───────────────────────────────────────────────────────────────
function DoctorCard({ doc }) {
  const [imgError, setImgError] = useState(false);
  const doctorImg = (!imgError && (doc.image || doc.profileImage))
    || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600";

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Layer */}
      <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Image
            src={doctorImg}
            alt={doc.doctorName || doc.name || "Doctor"}
            width={400}
            height={400}
            unoptimized
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top"
          />
        </motion.div>

        {/* Dark gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Verified Badge */}
        {doc.verificationStatus === 'verified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-3 right-3 bg-emerald-500 text-white flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow"
          >
            <FaCheckCircle className="text-[10px]" /> Verified
          </motion.div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md">
          <FaStar className="text-amber-400 text-xs" />
          <span>{doc.rating || "4.9"}</span>
          <span className="text-slate-400 font-medium text-[11px]">({doc.reviews || "120"})</span>
        </div>

        {/* Hover: Book Now overlay button */}
        <motion.div
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <a
            href={`/appointments/book/${doc._id || doc.id}`}
            className="bg-[#00A3E0] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1 hover:bg-[#0082b3] transition-colors"
          >
            Book <FaArrowRight className="text-[9px]" />
          </a>
        </motion.div>
      </div>

      {/* Content Layer */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#00A3E0] transition-colors duration-200">
            {doc.doctorName || doc.name || "Specialist Provider"}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[#00A3E0] text-xs font-semibold">
              {doc.specialization || "General Health"}
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-400 text-xs font-medium">
              {doc.experience || "5"} yrs exp
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <FaStethoscope className="text-slate-300 text-[10px]" />
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {doc.hospitalName || "Affiliated Clinic"}
            </p>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block leading-none mb-1">
              Consultation
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              {doc.consultationFee || doc.fee || "500"}{" "}
              <span className="text-sm font-semibold text-slate-400">BDT</span>
            </span>
          </div>

          <a
            href={`/appointments/book/${doc._id || doc.id}`}
            className="bg-[#00A3E0] hover:bg-[#0082b3] active:scale-95 text-white font-bold text-xs tracking-wide px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5"
          >
            Book Now <FaArrowRight className="text-[10px]" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FeaturedDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // ✅ FIXED: only fetches verified doctors from the live Doctor collection
        const res = await fetch("http://localhost:5000/api/doctors");
        if (!res.ok) throw new Error("Failed to fetch doctors.");
        const data = await res.json();

        // ✅ FIXED: reads data.doctors (not raw array) since endpoint returns { success, doctors }
        if (data.success && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        }
      } catch (err) {
        console.error("Doctor fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  const currentDoctors = doctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page === '...' || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <div className="space-y-2">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 bg-[#e6f6fc] text-[#00A3E0] text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide"
            >
              <FaStar className="text-[9px] text-amber-400" /> Top Rated
            </motion.span>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Featured Specialists
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Hand-picked experts with exceptional patient satisfaction.
            </p>
          </div>

          <motion.a
            href="/find-doctors"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-bold text-[#00A3E0] hover:text-[#0082b3] transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-end"
          >
            View All Doctors <FaArrowRight className="text-[10px]" />
          </motion.a>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : doctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-slate-200 rounded-2xl"
          >
            <FaStethoscope className="text-4xl text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              No verified specialists available yet.
            </p>
            <p className="text-xs text-slate-300 mt-1">Check back soon.</p>
          </motion.div>
        ) : (
          <>
            {/* Cards Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {currentDoctors.map(doc => (
                  <DoctorCard key={doc._id || doc.id} doc={doc} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 mt-14 pt-8 border-t border-slate-100"
              >
                {/* Prev */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage === 1
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <FaChevronLeft className="text-[10px]" /> Prev
                </motion.button>

                {/* Page Numbers */}
                {getPaginationNumbers().map((page, i) => (
                  <motion.button
                    key={i}
                    whileHover={page !== '...' ? { scale: 1.1 } : {}}
                    whileTap={page !== '...' ? { scale: 0.95 } : {}}
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      page === '...'
                        ? 'text-slate-400 cursor-default'
                        : currentPage === page
                        ? 'bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/30'
                        : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}

                {/* Next */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage === totalPages
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Next <FaChevronRight className="text-[10px]" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}

      </div>
    </section>
  );
}