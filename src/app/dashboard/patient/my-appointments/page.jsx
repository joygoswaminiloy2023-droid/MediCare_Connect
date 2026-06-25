"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Loader2, X, Check, Star, CreditCard, CheckCircle, XCircle, Clock3 } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const BACKEND = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

const STATUS_CONFIG = {
  pending:   { label: "Awaiting Doctor",  bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  icon: Clock3 },
  confirmed: { label: "Confirmed",         bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   icon: CheckCircle },
  completed: { label: "Completed",         bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",icon: CheckCircle },
  rejected:  { label: "Rejected by Doctor",bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200",    icon: XCircle },
  cancelled: { label: "Cancelled",         bg: "bg-slate-50",   text: "text-slate-500",  border: "border-slate-200",  icon: XCircle },
};

export default function PatientMyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments]   = useState([]);
  const [reviews, setReviews]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("all");
  const [selectedApt, setSelectedApt]     = useState(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [actionLoading, setActionLoading] = useState(null);

  const { data: session } = authClient.useSession();
  const patientEmail = session?.user?.email;

  useEffect(() => {
    if (!patientEmail) return;
    Promise.all([
      fetch(`${BACKEND}/api/patients/history/${patientEmail}`).then(r => r.json()),
      fetch(`${BACKEND}/api/patients/reviews/${patientEmail}`).then(r => r.json()),
    ])
      .then(([aptData, revData]) => {
        if (aptData.success) setAppointments(aptData.appointments || []);
        if (revData.success) setReviews(revData.reviews || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientEmail]);

  // Check if patient already reviewed a specific doctor for an appointment
  const hasReviewed = (apt) =>
    reviews.some(r => r.doctorId?.toString() === apt.doctorId?.toString());

  const filtered = filter === "all"
    ? appointments
    : appointments.filter(a => a.appointmentStatus === filter);

  const counts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.appointmentStatus === "pending").length,
    confirmed: appointments.filter(a => a.appointmentStatus === "confirmed").length,
    completed: appointments.filter(a => a.appointmentStatus === "completed").length,
    rejected:  appointments.filter(a => a.appointmentStatus === "rejected").length,
    cancelled: appointments.filter(a => a.appointmentStatus === "cancelled").length,
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error("Please select date and time"); return;
    }
    setActionLoading("reschedule");
    try {
      const res  = await fetch(`${BACKEND}/api/patients/${selectedApt._id}/reschedule`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ newDate: rescheduleData.date, newTime: rescheduleData.time })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a =>
          a._id === selectedApt._id
            ? { ...a, appointmentDate: rescheduleData.date, appointmentTime: rescheduleData.time }
            : a
        ));
        toast.success("Appointment rescheduled!");
        setShowReschedule(false);
        setSelectedApt(null);
      } else toast.error(data.message);
    } catch { toast.error("Network error"); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    setActionLoading(id);
    try {
      const res  = await fetch(`${BACKEND}/api/patients/${id}/cancel`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a =>
          a._id === id ? { ...a, appointmentStatus: "cancelled" } : a
        ));
        toast.success("Appointment cancelled.");
      } else toast.error(data.message);
    } catch { toast.error("Network error"); }
    finally { setActionLoading(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#00A3E0] mx-auto mb-3" size={28} />
        <p className="text-slate-400 text-xs font-bold uppercase">Loading appointments...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">My Appointments</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          Track your bookings and manage schedules
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries({ all: "All", pending: "Pending", confirmed: "Confirmed", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled" }).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filter === key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
            }`}>
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              filter === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <AlertCircle className="text-slate-200 mx-auto mb-3" size={40} />
          <p className="text-slate-400 font-bold text-sm">No {filter === "all" ? "" : filter} appointments.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((apt, i) => {
              const status    = apt.appointmentStatus || "pending";
              const cfg       = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const isPaid    = apt.paymentStatus === "paid";
              const canReview = status === "completed" && !hasReviewed(apt);
              const id        = apt._id?.toString();

              return (
                <motion.div key={id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.04 }}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-5 ${
                    status === "rejected" ? "border-red-200 bg-red-50/30" : "border-slate-200"
                  }`}>

                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Status banner for rejected */}
                      {status === "rejected" && (
                        <div className="flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-xl mb-3">
                          <XCircle size={14} />
                          Your appointment was rejected by the doctor. Please book again or choose another doctor.
                        </div>
                      )}

                      {/* Status banner for confirmed */}
                      {status === "confirmed" && (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl mb-3">
                          <CheckCircle size={14} />
                          Your appointment has been confirmed by the doctor!
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-black text-slate-900 text-sm">Dr. {apt.doctorName}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <StatusIcon size={9} />
                          {cfg.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-3">
                        <span className="font-semibold text-slate-600">Symptoms:</span> {apt.symptoms}
                      </p>

                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Calendar size={11} className="text-[#00A3E0]" />
                          {apt.appointmentDate}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock size={11} className="text-[#00A3E0]" />
                          {apt.appointmentTime}
                        </span>
                        {/* ✅ Payment status — only show Pay button if NOT rejected */}
                        {status !== "rejected" && status !== "cancelled" && (
                          <span className={`flex items-center gap-1.5 text-[11px] font-bold ${isPaid ? "text-emerald-600" : "text-red-500"}`}>
                            {isPaid
                              ? <><CheckCircle size={11} /> Paid</>
                              : status === "confirmed"
                                ? (
                                  <button
                                    onClick={() => router.push(`/appointments/book/${apt.doctorId}`)}
                                    className="flex items-center gap-1.5 bg-[#00A3E0] text-white text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-[#0082b3] transition-all"
                                  >
                                    <CreditCard size={10} /> Pay Now
                                  </button>
                                )
                                : <><XCircle size={11} /> Unpaid</>
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">

                      {/* Reschedule / Cancel — only for pending or confirmed */}
                      {["pending", "confirmed"].includes(status) && (
                        <>
                          <button
                            onClick={() => { setSelectedApt(apt); setRescheduleData({ date: apt.appointmentDate, time: apt.appointmentTime }); setShowReschedule(true); }}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(id)}
                            disabled={actionLoading === id}
                            className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {actionLoading === id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                            Cancel
                          </button>
                        </>
                      )}

                      {/* ✅ Write Review — only on completed and not yet reviewed */}
                      {canReview && (
                        <button
                          onClick={() => router.push(`/dashboard/patient/reviews?doctorId=${apt.doctorId}&doctorName=${encodeURIComponent(apt.doctorName)}&appointmentId=${id}`)}
                          className="flex items-center gap-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          <Star size={12} /> Write Review
                        </button>
                      )}

                      {/* Already reviewed */}
                      {status === "completed" && hasReviewed(apt) && (
                        <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                          ✓ Reviewed
                        </span>
                      )}

                      {/* Rejected — rebook */}
                      {status === "rejected" && (
                        <button
                          onClick={() => router.push("/find-doctors")}
                          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all"
                        >
                          Find Another Doctor
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showReschedule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-black text-slate-900">Reschedule Appointment</h3>
                <button onClick={() => setShowReschedule(false)}><X className="text-slate-400" size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">New Date</label>
                  <input type="date" value={rescheduleData.date}
                    onChange={e => setRescheduleData(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#00A3E0]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">New Time</label>
                  <input type="time" value={rescheduleData.time}
                    onChange={e => setRescheduleData(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#00A3E0]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowReschedule(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm">
                    Cancel
                  </button>
                  <button onClick={handleReschedule} disabled={actionLoading === "reschedule"}
                    className="flex-1 px-4 py-3 bg-[#00A3E0] text-white font-bold rounded-xl hover:bg-[#0082b3] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                    {actionLoading === "reschedule" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}