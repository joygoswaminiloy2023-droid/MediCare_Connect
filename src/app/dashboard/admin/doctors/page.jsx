"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  GraduationCap, Briefcase, DollarSign, Mail, Clock,
  CheckCircle2, RotateCcw, Inbox, UserCheck2, XCircle,
  Stethoscope, Building2, Loader2
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000';


export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
const res = await fetch(`${BACKEND_URL}/api/admin/doctors`);      const data = await res.json();
      if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/doctors/verify/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Doctor approved and now live.");
        setDoctors(prev =>
          prev.map(doc =>
            doc._id?.toString() === id
              ? { ...doc, verificationStatus: "verified" }
              : doc
          )
        );
      } else {
        toast.error(data.message || "Approval failed.");
      }
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/doctors/verify/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: false }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Verification revoked.");
        setDoctors(prev =>
          prev.map(doc =>
            doc._id?.toString() === id
              ? { ...doc, verificationStatus: "pending" }
              : doc
          )
        );
      } else {
        toast.error(data.message || "Revoke failed.");
      }
    } catch (err) {
      console.error("Revoke error:", err);
      toast.error("Revoke failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Permanently reject this application? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/doctors/reject/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Application rejected.");
        setDoctors(prev => prev.filter(doc => doc._id?.toString() !== id));
      } else {
        toast.error(data.message || "Rejection failed.");
      }
    } catch (err) {
      console.error("Reject error:", err);
      toast.error("Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const pending = doctors.filter(d => d.verificationStatus === "pending");
  const approved = doctors.filter(d => d.verificationStatus === "verified");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Loading practitioners...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Practitioners", value: doctors.length, icon: Stethoscope, color: "text-slate-700 bg-slate-100" },
    { label: "Pending Review", value: pending.length, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Verified & Live", value: approved.length, icon: CheckCircle2, color: "text-teal-600 bg-teal-50" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Manage Practitioners</h1>
        <p className="text-slate-500 text-xs font-medium mt-1">
          Review pending applications and manage verified doctors.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── PENDING APPLICATIONS ───────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-amber-500" />
          <h2 className="text-base font-bold text-slate-800">Pending Applications</h2>
          <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <Inbox size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-xs font-medium">No pending applications right now.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {pending.map(doc => (
                <motion.div
                  key={doc._id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <DoctorCard
                    doc={doc}
                    status="pending"
                    isLoading={actionLoading === doc._id?.toString()}
                    onApprove={() => handleApprove(doc._id?.toString())}
                    onReject={() => handleReject(doc._id?.toString())}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── VERIFIED DOCTORS ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={16} className="text-teal-500" />
          <h2 className="text-base font-bold text-slate-800">Verified Doctors</h2>
          <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {approved.length}
          </span>
        </div>

        {approved.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <Inbox size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-xs font-medium">No approved doctors yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {approved.map(doc => (
                <motion.div
                  key={doc._id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <DoctorCard
                    doc={doc}
                    status="verified"
                    isLoading={actionLoading === doc._id?.toString()}
                    onRevoke={() => handleRevoke(doc._id?.toString())}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Doctor Card Component ──────────────────────────────────────────────────
function DoctorCard({ doc, status, isLoading, onApprove, onReject, onRevoke }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <img
          src={doc.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
          alt={doc.doctorName}
          className="w-12 h-12 rounded-full object-cover border border-slate-100 flex-shrink-0"
          onError={e => { e.target.src = "https://via.placeholder.com/48?text=Dr"; }}
        />
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">{doc.doctorName}</p>
          <p className="text-sm text-teal-600 font-medium truncate flex items-center gap-1 mt-0.5">
            <Stethoscope size={12} /> {doc.specialization}
          </p>
          <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
            <Building2 size={11} /> {doc.hospitalName}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-slate-500 mb-4 flex-1">
        <p className="flex items-center gap-2"><GraduationCap size={13} className="text-slate-400 flex-shrink-0" /> {doc.degrees}</p>
        <p className="flex items-center gap-2"><Briefcase size={13} className="text-slate-400 flex-shrink-0" /> {doc.experience} years experience</p>
        <p className="flex items-center gap-2"><DollarSign size={13} className="text-slate-400 flex-shrink-0" /> ${doc.consultationFee} consultation fee</p>
        <p className="flex items-center gap-2 truncate"><Mail size={13} className="text-slate-400 flex-shrink-0" /> {doc.email}</p>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {status === "pending" && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
            <Clock size={11} /> Awaiting Approval
          </span>
        )}
        {status === "verified" && (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
            <CheckCircle2 size={11} /> Verified & Live
          </span>
        )}
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><UserCheck2 size={14} /> Approve</>}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-600 border border-rose-200 text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><XCircle size={14} /> Reject</>}
          </motion.button>
        </div>
      )}

      {status === "verified" && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onRevoke}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 border border-slate-200 text-xs font-bold py-2.5 rounded-xl transition-colors"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><RotateCcw size={14} /> Revoke Verification</>}
        </motion.button>
      )}
    </motion.div>
  );
}