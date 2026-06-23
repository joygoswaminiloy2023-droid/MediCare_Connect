"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ClipboardCheck, Calendar, Clock, User, Stethoscope, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const STATUS_STYLES = {
  pending:   "bg-amber-100 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
  rejected:  "bg-red-100 text-red-600 border border-red-200",
  completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter]             = useState("all");
  const [doctorId, setDoctorId]         = useState(null);

  // ── Fetch doctor session + appointments ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Get session
        const sessionRes  = await fetch("/api/auth/get-session");
        const sessionData = await sessionRes.json();
        const user        = sessionData?.user || sessionData?.data?.user;
        if (!user?.email) { setLoading(false); return; }

        // Get doctor profile to get _id
        const profileRes  = await fetch(`${BACKEND}/api/doctors/profile/${user.email}`);
        const profileData = await profileRes.json();
        if (profileData.success) {
          setDoctorId(profileData.profile._id);
        }

        // Get appointments
        const apptRes  = await fetch(`${BACKEND}/api/doctors/appointments/${user.email}`);
        const apptData = await apptRes.json();
        if (apptData.success) setAppointments(apptData.appointments);

      } catch (err) {
        console.error("Failed to load appointments:", err);
        toast.error("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Accept appointment ────────────────────────────────────────────────
  const handleAccept = async (appointmentId) => {
    setActionLoading(appointmentId + "_accept");
    try {
      const res  = await fetch(`${BACKEND}/api/doctors/appointments/${appointmentId}/accept`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(a => a._id === appointmentId ? { ...a, appointmentStatus: "confirmed" } : a)
        );
        toast.success("Appointment confirmed!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject appointment ────────────────────────────────────────────────
  const handleReject = async (appointmentId) => {
    if (!confirm("Reject this appointment?")) return;
    setActionLoading(appointmentId + "_reject");
    try {
      const res  = await fetch(`${BACKEND}/api/doctors/appointments/${appointmentId}/reject`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(a => a._id === appointmentId ? { ...a, appointmentStatus: "rejected" } : a)
        );
        toast.success("Appointment rejected.");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Go to prescribe page ──────────────────────────────────────────────
  const handlePrescribe = (appointment) => {
    const params = new URLSearchParams({
      appointmentId: appointment._id,
      patientName:   appointment.patientName || "",
      patientId:     appointment.patientId?.toString() || "",
      doctorId:      doctorId?.toString() || "",
      symptoms:      appointment.symptoms || "",
    });
    router.push(`/dashboard/doctor/prescriptions?${params.toString()}`);
  };

  const filtered = filter === "all"
    ? appointments
    : appointments.filter(a => a.appointmentStatus === filter);

  const counts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.appointmentStatus === "pending").length,
    confirmed: appointments.filter(a => a.appointmentStatus === "confirmed").length,
    completed: appointments.filter(a => a.appointmentStatus === "completed").length,
    rejected:  appointments.filter(a => a.appointmentStatus === "rejected").length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#00A3E0] mx-auto mb-3" size={28} />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading appointments...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Appointment Requests</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          Review, accept, or reject patient appointment requests
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",       label: "All" },
          { key: "pending",   label: "Pending" },
          { key: "confirmed", label: "Confirmed" },
          { key: "completed", label: "Completed" },
          { key: "rejected",  label: "Rejected" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filter === key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
            }`}>
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              filter === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <AlertCircle className="text-slate-200 mx-auto mb-3" size={40} />
          <p className="text-slate-400 font-bold text-sm">No {filter === "all" ? "" : filter} appointments yet.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((apt, i) => {
              const id     = apt._id?.toString();
              const status = apt.appointmentStatus || "pending";

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Left: patient info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar placeholder */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00A3E0]/20 to-[#0064b4]/20 border border-[#00A3E0]/20 flex items-center justify-center flex-shrink-0">
                        <User className="text-[#00A3E0]" size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-sm">
                            {apt.patientName || "Patient"}
                          </h3>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                            {status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                          <span className="font-semibold text-slate-600">Symptoms:</span> {apt.symptoms}
                        </p>

                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Calendar size={11} className="text-[#00A3E0]" />
                            {apt.appointmentDate}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Clock size={11} className="text-[#00A3E0]" />
                            {apt.appointmentTime}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Stethoscope size={11} className="text-emerald-500" />
                            {apt.paymentStatus === "paid"
                              ? <span className="text-emerald-600 font-bold">Paid</span>
                              : <span className="text-red-500 font-bold">Unpaid</span>
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Pending → Accept / Reject */}
                      {status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAccept(id)}
                            disabled={actionLoading === id + "_accept"}
                            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {actionLoading === id + "_accept"
                              ? <Loader2 size={12} className="animate-spin" />
                              : <Check size={12} />
                            }
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(id)}
                            disabled={actionLoading === id + "_reject"}
                            className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {actionLoading === id + "_reject"
                              ? <Loader2 size={12} className="animate-spin" />
                              : <X size={12} />
                            }
                            Reject
                          </button>
                        </>
                      )}

                      {/* Confirmed → Prescribe button */}
                      {status === "confirmed" && (
                        <button
                          onClick={() => handlePrescribe(apt)}
                          className="flex items-center gap-1.5 bg-[#00A3E0] hover:bg-[#0082b3] text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-[#00A3E0]/20"
                        >
                          <ClipboardCheck size={13} />
                          Prescribe
                        </button>
                      )}

                      {/* Completed */}
                      {status === "completed" && (
                        <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl uppercase tracking-wider">
                          ✓ Completed
                        </span>
                      )}

                      {/* Rejected */}
                      {status === "rejected" && (
                        <span className="text-[10px] text-red-500 font-black bg-red-50 border border-red-200 px-3 py-2 rounded-xl uppercase tracking-wider">
                          ✗ Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}