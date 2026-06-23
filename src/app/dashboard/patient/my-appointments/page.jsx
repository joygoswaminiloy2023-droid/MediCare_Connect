"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Stethoscope, Edit2, Trash2, AlertCircle, Loader2, X, Check } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const STATUS_STYLES = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function PatientMyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedApt, setSelectedApt] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const { data: session } = authClient.useSession();
  const patientEmail = session?.user?.email;

  useEffect(() => {
    if (!patientEmail) return;

    fetch(`${BACKEND}/api/patients/history/${patientEmail}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setAppointments(data.appointments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientEmail]);

  // Filter appointments
  const filtered = filter === "all"
    ? appointments
    : appointments.filter(a => a.appointmentStatus === filter);

  // Reschedule handler
  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error("Please select date and time");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/patients/${selectedApt._id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate: rescheduleData.date, newTime: rescheduleData.time })
      });
      
      const data = await res.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(a => a._id === selectedApt._id
            ? { ...a, appointmentDate: rescheduleData.date, appointmentTime: rescheduleData.time }
            : a
          )
        );
        toast.success("Appointment rescheduled!");
        setShowRescheduleModal(false);
        setSelectedApt(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel handler
  const handleCancel = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/patients/${appointmentId}/cancel`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(a => a._id === appointmentId
            ? { ...a, appointmentStatus: "cancelled" }
            : a
          )
        );
        toast.success("Appointment cancelled");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#00A3E0] mx-auto mb-3" size={28} />
        <p className="text-slate-400 text-xs font-bold uppercase">Loading appointments...</p>
      </div>
    </div>
  );

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.appointmentStatus === "pending").length,
    confirmed: appointments.filter(a => a.appointmentStatus === "confirmed").length,
    completed: appointments.filter(a => a.appointmentStatus === "completed").length,
    cancelled: appointments.filter(a => a.appointmentStatus === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">My Appointments</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          View, reschedule, or cancel your appointments
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "confirmed", label: "Confirmed" },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
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

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <AlertCircle className="text-slate-200 mx-auto mb-3" size={40} />
          <p className="text-slate-400 font-bold text-sm">No {filter === "all" ? "" : filter} appointments.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((apt, i) => (
              <motion.div
                key={apt._id?.toString()}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left: appointment info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-black text-slate-900 text-sm">Dr. {apt.doctorName}</h3>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${STATUS_STYLES[apt.appointmentStatus]}`}>
                        {apt.appointmentStatus}
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
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold ${
                        apt.paymentStatus === "paid" ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {apt.paymentStatus === "paid" ? "✓ Paid" : "✗ Unpaid"}
                      </span>
                    </div>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {["pending", "confirmed"].includes(apt.appointmentStatus) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedApt(apt);
                            setRescheduleData({ date: apt.appointmentDate, time: apt.appointmentTime });
                            setShowRescheduleModal(true);
                          }}
                          className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          <Edit2 size={12} />
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(apt._id)}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Cancel
                        </button>
                      </>
                    )}

                    {apt.appointmentStatus === "completed" && (
                      <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl uppercase tracking-wider">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900">Reschedule Appointment</h3>
                <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">New Date</label>
                  <input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">New Time</label>
                  <input
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-sm font-semibold"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-[#00A3E0] text-white font-bold rounded-2xl hover:bg-[#0082b3] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
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