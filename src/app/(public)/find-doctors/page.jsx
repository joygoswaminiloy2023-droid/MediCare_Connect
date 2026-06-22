"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar, FaCheckCircle, FaSearch, FaFilter,
  FaTimes, FaArrowRight, FaStethoscope, FaHospital,
  FaUserMd, FaThLarge, FaList, FaChevronDown, FaChevronUp,
  FaSpinner
} from "react-icons/fa";

const SPECIALIZATIONS = [
  "All Types", "Cardiology", "Neurology", "Orthopedic Surgery",
  "Gynecology & Obstetrics", "Pediatrics", "Dermatology",
  "Ophthalmology", "Psychiatry", "General Medicine", "ENT"
];

const RATINGS = [
  { label: "Any Rating", value: 0 },
  { label: "4.5 & above", value: 4.5 },
  { label: "4.0 & above", value: 4.0 },
  { label: "3.5 & above", value: 3.5 },
];

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } },
};
const gridVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

// ── Build query string from filter state ────────────────────────────────────
function buildQuery({ search, specialization, minRating, maxFee, page, limit }) {
  const params = new URLSearchParams();
  if (search.trim())                      params.set("search", search.trim());
  if (specialization !== "All Types")     params.set("specialization", specialization);
  if (minRating > 0)                      params.set("minRating", minRating);
  if (maxFee < 1000)                      params.set("maxFee", maxFee);
  params.set("page", page);
  params.set("limit", limit);
  return params.toString();
}

function SkeletonGrid() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="flex justify-between items-center pt-3">
          <div className="h-6 bg-slate-100 rounded w-20" />
          <div className="h-9 bg-slate-100 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-5 animate-pulse">
      <div className="w-24 h-24 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-1/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function GridCard({ doc }) {
  const [imgErr, setImgErr] = useState(false);
  const src = (!imgErr && (doc.image || doc.profileImage))
    || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600";

  return (
    <motion.div variants={cardVariants} layout
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden"
    >
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        <motion.div className="w-full h-full" whileHover={{ scale: 1.04 }} transition={{ duration: 0.35 }}>
          <Image src={src} alt={doc.doctorName || "Doctor"} width={400} height={300}
            unoptimized onError={() => setImgErr(true)}
            className="w-full h-full object-cover object-top" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-emerald-500 text-white flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase shadow">
          <FaCheckCircle className="text-[9px]" /> Verified
        </div>
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md">
          <FaStar className="text-amber-400 text-xs" />
          <span className="text-slate-800">{doc.rating || "4.9"}</span>
          <span className="text-slate-400 font-medium text-[11px]">({doc.reviews || "120"})</span>
        </div>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <a href={`/appointments/book/${doc._id}`}
            className="bg-[#00A3E0] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1 hover:bg-[#0082b3] transition-colors">
            Book <FaArrowRight className="text-[9px]" />
          </a>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00A3E0] transition-colors leading-snug">
          {doc.doctorName || "Specialist"}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[#00A3E0] text-xs font-semibold">{doc.specialization || "General"}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 text-xs">{doc.experience || "5"} yrs</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <FaHospital className="text-slate-300 text-[10px] flex-shrink-0" />
          <p className="text-[11px] text-slate-400 truncate">{doc.hospitalName || "Clinic"}</p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Consultation</span>
            <span className="text-lg font-extrabold text-slate-900">
              {doc.consultationFee || "500"} <span className="text-sm font-semibold text-slate-400">BDT</span>
            </span>
          </div>
          <a href={`/appointments/book/${doc._id}`}
            className="bg-[#00A3E0] hover:bg-[#0082b3] active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5">
            Book Now <FaArrowRight className="text-[10px]" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function ListCard({ doc }) {
  const [imgErr, setImgErr] = useState(false);
  const src = (!imgErr && (doc.image || doc.profileImage))
    || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600";

  return (
    <motion.div variants={cardVariants} layout
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex gap-5 p-4 sm:p-5 items-center"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
        <Image src={src} alt={doc.doctorName || "Doctor"} width={96} height={96}
          unoptimized onError={() => setImgErr(true)}
          className="w-full h-full object-cover object-top" />
        <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-0.5">
          <FaCheckCircle className="text-white text-[8px]" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00A3E0] transition-colors">
              {doc.doctorName || "Specialist"}
            </h3>
            <span className="text-[#00A3E0] text-xs font-semibold">{doc.specialization || "General"}</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg flex-shrink-0">
            <FaStar className="text-amber-400 text-[10px]" />
            <span className="text-xs font-bold text-slate-700">{doc.rating || "4.9"}</span>
            <span className="text-[10px] text-slate-400">({doc.reviews || "120"})</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><FaHospital className="text-[10px]" /> {doc.hospitalName || "Clinic"}</span>
          <span>•</span>
          <span>{doc.experience || "5"} yrs exp</span>
          {doc.degrees && <><span>•</span><span>{doc.degrees}</span></>}
        </div>
        {doc.availableSlots?.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {(Array.isArray(doc.availableSlots) ? doc.availableSlots : [doc.availableSlots])
              .slice(0, 3).map((slot, i) => (
              <span key={i} className="bg-blue-50 text-[#00A3E0] text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                {slot}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <div className="text-right">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Fee</span>
          <span className="text-base font-extrabold text-slate-900">
            {doc.consultationFee || "500"} <span className="text-xs font-semibold text-slate-400">BDT</span>
          </span>
        </div>
        <a href={`/appointments/book/${doc._id}`}
          className="bg-[#00A3E0] hover:bg-[#0082b3] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap">
          Book Now <FaArrowRight className="text-[10px]" />
        </a>
      </div>
    </motion.div>
  );
}

// ── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ activeSpec, setActiveSpec, minRating, setMinRating, maxFee, setMaxFee, onClear, hasActive }) {
  const [open, setOpen] = useState({ type: true, rating: true, price: true });
  const toggle = key => setOpen(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FaFilter className="text-[#00A3E0] text-sm" /> Filters
        </h3>
        {hasActive && (
          <button onClick={onClear}
            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
            <FaTimes className="text-[10px]" /> Clear All
          </button>
        )}
      </div>

      {/* Doctor Type */}
      <div className="border-b border-slate-100">
        <button onClick={() => toggle("type")}
          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
          Doctor Type
          {open.type ? <FaChevronUp className="text-[11px] text-slate-400" /> : <FaChevronDown className="text-[11px] text-slate-400" />}
        </button>
        <AnimatePresence>
          {open.type && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-5 pb-4 space-y-1">
                {SPECIALIZATIONS.map(spec => (
                  <button key={spec} onClick={() => setActiveSpec(spec)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-all ${
                      activeSpec === spec ? "bg-[#00A3E0] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}>
                    {spec}
                    {activeSpec === spec && <span className="float-right">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating */}
      <div className="border-b border-slate-100">
        <button onClick={() => toggle("rating")}
          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
          Rating
          {open.rating ? <FaChevronUp className="text-[11px] text-slate-400" /> : <FaChevronDown className="text-[11px] text-slate-400" />}
        </button>
        <AnimatePresence>
          {open.rating && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-5 pb-4 space-y-1">
                {RATINGS.map(r => (
                  <button key={r.value} onClick={() => setMinRating(r.value)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      minRating === r.value ? "bg-[#00A3E0] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}>
                    {r.value > 0 && <FaStar className={`text-[10px] ${minRating === r.value ? "text-white" : "text-amber-400"}`} />}
                    {r.label}
                    {minRating === r.value && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price */}
      <div>
        <button onClick={() => toggle("price")}
          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
          Price Range
          {open.price ? <FaChevronUp className="text-[11px] text-slate-400" /> : <FaChevronDown className="text-[11px] text-slate-400" />}
        </button>
        <AnimatePresence>
          {open.price && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-semibold">0 BDT</span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                    Up to {maxFee} BDT
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">1000 BDT</span>
                </div>
                <input type="range" min={100} max={1000} step={50}
                  value={maxFee} onChange={e => setMaxFee(Number(e.target.value))}
                  className="w-full accent-[#00A3E0] cursor-pointer" />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[200, 400, 600, 1000].map(p => (
                    <button key={p} onClick={() => setMaxFee(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        maxFee === p
                          ? "bg-[#00A3E0] text-white border-[#00A3E0]"
                          : "border-slate-200 text-slate-500 hover:border-[#00A3E0] hover:text-[#00A3E0]"
                      }`}>
                      ≤{p}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FindDoctorsPage() {
  const [doctors, setDoctors]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [activeSpec, setActiveSpec]   = useState("All Types");
  const [minRating, setMinRating]     = useState(0);
  const [maxFee, setMaxFee]           = useState(1000);
  const [view, setView]               = useState("grid");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = view === "grid" ? 9 : 8;

  // Debounce search so we don't hit backend on every keystroke
  const searchTimeout = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  // ── Fetch from backend whenever filters change ───────────────────────────
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery({
        search: debouncedSearch,
        specialization: activeSpec,
        minRating,
        maxFee,
        page: currentPage,
        limit: PER_PAGE
      });

      const res  = await fetch(`http://localhost:5000/api/doctors?${qs}`);
      const data = await res.json();

      if (data.success) {
        setDoctors(data.doctors);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeSpec, minRating, maxFee, currentPage, PER_PAGE]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, activeSpec, minRating, maxFee, view]);

  const clearFilters = () => {
    setSearch(""); setActiveSpec("All Types"); setMinRating(0); setMaxFee(1000); setCurrentPage(1);
  };

  const hasActive = debouncedSearch || activeSpec !== "All Types" || minRating > 0 || maxFee < 1000;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-[#00A3E0] text-[11px] font-bold px-3 py-1.5 rounded-full mb-3">
              <FaUserMd className="text-[10px]" /> {total} Verified Specialists
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Find Your Doctor</h1>
            <p className="text-slate-400 text-sm max-w-lg">
              Filter by specialization, rating, and consultation fee to find the right specialist for you.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-6 relative max-w-2xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialization, or hospital..."
              className="w-full pl-11 pr-10 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm font-medium outline-none focus:border-[#00A3E0] focus:bg-white/15 transition-all" />
            {search
              ? <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"><FaTimes /></button>
              : loading && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin text-sm" />
            }
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex gap-7">

          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel
              activeSpec={activeSpec} setActiveSpec={setActiveSpec}
              minRating={minRating} setMinRating={setMinRating}
              maxFee={maxFee} setMaxFee={setMaxFee}
              onClear={clearFilters} hasActive={hasActive}
            />
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:border-[#00A3E0] hover:text-[#00A3E0] transition-all">
                  <FaFilter className="text-[11px]" /> Filters
                  {hasActive && <span className="w-2 h-2 rounded-full bg-[#00A3E0]" />}
                </button>

                {!loading && (
                  <p className="text-sm text-slate-500">
                    <span className="font-bold text-slate-800">{total}</span> doctor{total !== 1 ? "s" : ""} found
                    {hasActive && <span className="text-slate-400"> (filtered)</span>}
                  </p>
                )}
                {loading && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <FaSpinner className="animate-spin text-[#00A3E0]" /> Searching...
                  </p>
                )}
              </div>

              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button onClick={() => setView("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    view === "grid" ? "bg-[#00A3E0] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  <FaThLarge className="text-[11px]" /> Grid
                </button>
                <button onClick={() => setView("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    view === "list" ? "bg-[#00A3E0] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  <FaList className="text-[11px]" /> List
                </button>
              </div>
            </div>

            {/* Active filter tags */}
            {hasActive && (
              <div className="flex gap-2 flex-wrap mb-4">
                {activeSpec !== "All Types" && (
                  <span className="inline-flex items-center gap-1.5 bg-[#00A3E0]/10 text-[#00A3E0] text-xs font-bold px-3 py-1 rounded-full border border-[#00A3E0]/20">
                    <FaStethoscope className="text-[9px]" /> {activeSpec}
                    <button onClick={() => setActiveSpec("All Types")}><FaTimes className="text-[9px]" /></button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                    <FaStar className="text-[9px]" /> {minRating}+
                    <button onClick={() => setMinRating(0)}><FaTimes className="text-[9px]" /></button>
                  </span>
                )}
                {maxFee < 1000 && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                    ≤ {maxFee} BDT
                    <button onClick={() => setMaxFee(1000)}><FaTimes className="text-[9px]" /></button>
                  </span>
                )}
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                    "{debouncedSearch}"
                    <button onClick={() => setSearch("")}><FaTimes className="text-[9px]" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Cards */}
            {loading ? (
              <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
                {Array.from({ length: PER_PAGE }).map((_, i) =>
                  view === "grid" ? <SkeletonGrid key={i} /> : <SkeletonList key={i} />
                )}
              </div>
            ) : doctors.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
                <FaStethoscope className="text-5xl text-slate-200 mx-auto mb-4" />
                <p className="text-base font-bold text-slate-400">No doctors match your filters.</p>
                <p className="text-sm text-slate-300 mt-1 mb-5">Try adjusting your search or clearing filters.</p>
                <button onClick={clearFilters}
                  className="bg-[#00A3E0] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#0082b3] transition-colors">
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentPage}-${view}`}
                    variants={gridVariants} initial="hidden" animate="visible"
                    className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
                    {doctors.map(doc =>
                      view === "grid"
                        ? <GridCard key={doc._id} doc={doc} />
                        : <ListCard key={doc._id} doc={doc} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-slate-200">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentPage === 1 ? "text-slate-300 bg-white cursor-not-allowed border border-slate-100" : "text-slate-600 bg-white border border-slate-200 hover:border-[#00A3E0] hover:text-[#00A3E0]"
                      }`}>← Prev</button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p}
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                          currentPage === p
                            ? "bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/25"
                            : "text-slate-600 bg-white border border-slate-200 hover:border-[#00A3E0] hover:text-[#00A3E0]"
                        }`}>{p}</button>
                    ))}

                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentPage === totalPages ? "text-slate-300 bg-white cursor-not-allowed border border-slate-100" : "text-slate-600 bg-white border border-slate-200 hover:border-[#00A3E0] hover:text-[#00A3E0]"
                      }`}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 lg:hidden overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FaFilter className="text-[#00A3E0]" /> Filters
                </h3>
                <button onClick={() => setShowMobileFilter(false)} className="p-2 rounded-xl hover:bg-slate-100">
                  <FaTimes className="text-slate-500" />
                </button>
              </div>
              <div className="p-4">
                <FilterPanel
                  activeSpec={activeSpec} setActiveSpec={setActiveSpec}
                  minRating={minRating} setMinRating={setMinRating}
                  maxFee={maxFee} setMaxFee={setMaxFee}
                  onClear={clearFilters} hasActive={hasActive}
                />
              </div>
              <div className="p-5 border-t border-slate-100">
                <button onClick={() => setShowMobileFilter(false)}
                  className="w-full bg-[#00A3E0] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0082b3] transition-colors">
                  Show {total} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}