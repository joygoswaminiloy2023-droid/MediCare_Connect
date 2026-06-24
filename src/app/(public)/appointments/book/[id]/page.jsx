"use client";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar, FaCheckCircle, FaHospital, FaCalendarAlt,
  FaClock, FaUser, FaNotesMedical, FaArrowLeft, FaLock,
  FaShieldAlt, FaCreditCard, FaRegClock, FaRegCalendar,
  FaUserMd, FaEnvelope
} from "react-icons/fa";
import { Loader2, Clock, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

// ── Currency Conversion ──────────────────────────────────────────────────
const convertToBDT = (usdAmount) => {
  const conversionRate = 110; // 1 USD = 110 BDT
  return (usdAmount * conversionRate).toFixed(2);
};

// ── Duplicate Request Banner ──────────────────────────────────────────────────
function DuplicateBanner({ status, onGoToDashboard }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-2xl border-2 overflow-hidden"
      style={{
        borderColor: status === "confirmed" ? "#86efac" : "#fcd34d",
        background: status === "confirmed" ? "#f0fdf4" : "#fffbeb",
      }}
    >
      <div className={`px-5 py-3 flex items-center gap-3 ${status === "confirmed" ? "bg-emerald-100" : "bg-amber-100"}`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${status === "confirmed" ? "bg-emerald-200" : "bg-amber-200"}`}>
          {status === "confirmed"
            ? <CheckCircle2 className="text-emerald-600" size={18} />
            : <AlertTriangle className="text-amber-600" size={18} />
          }
        </div>
        <div>
          <p className={`text-sm font-black ${status === "confirmed" ? "text-emerald-800" : "text-amber-800"}`}>
            {status === "confirmed" ? "Already Confirmed!" : "Request Already Sent!"}
          </p>
          <p className={`text-xs font-medium ${status === "confirmed" ? "text-emerald-600" : "text-amber-600"}`}>
            {status === "confirmed"
              ? "You have a confirmed appointment with this doctor."
              : "Your request is pending doctor approval."}
          </p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className={`text-xs leading-relaxed mb-4 ${status === "confirmed" ? "text-emerald-700" : "text-amber-700"}`}>
          {status === "confirmed"
            ? "You already have a confirmed appointment with this doctor. Please check your appointments dashboard to view details or proceed to payment."
            : "You already have a pending appointment request with this doctor. Please wait for their response before making another request."}
        </p>
        <button
          onClick={onGoToDashboard}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${status === "confirmed"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
        >
          View My Appointments <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}

export default function BookingPage({ params }) {
  const { id } = use(params);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [patientEmail, setPatientEmail] = useState("");

  const [appointmentRequested, setAppointmentRequested] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null);
  const [doctorAccepted, setDoctorAccepted] = useState(false);
  const [duplicateStatus, setDuplicateStatus] = useState(null);

  const [form, setForm] = useState({
    patientName: "", patientEmail: "",
    date: "", timeSlot: "", problem: "",
  });

  // ── Poll for doctor acceptance ────────────────────────────────────────
  useEffect(() => {
    if (!appointmentRequested || !pendingAppointmentId || doctorAccepted) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/api/appointments/check/${pendingAppointmentId}`);
        const data = await res.json();
        if (data.success) {
          if (data.status === "confirmed") {
            setDoctorAccepted(true);
            toast.success("🎉 Doctor confirmed your request! Proceed to payment.", { position: "top-center" });
            clearInterval(interval);
          } else if (data.status === "rejected") {
            toast.error("Doctor rejected your request.", { position: "top-center" });
            setAppointmentRequested(false);
            setPendingAppointmentId(null);
            clearInterval(interval);
          }
        }
      } catch { }
    }, 3000);
    return () => clearInterval(interval);
  }, [appointmentRequested, pendingAppointmentId, doctorAccepted]);

  // ── Fetch doctor ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("cancelled") === "true") setCancelled(true);
    }
    fetch(`${BACKEND}/api/appointments/doctor/${id}`)
      .then(r => r.json())
      .then(data => { if (data.success) setDoctor(data.doctor); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // ── Pre-fill + check duplicate ────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/get-session")
      .then(r => r.json())
      .then(async data => {
        const user = data?.user || data?.data?.user;
        if (user) {
          setPatientId(user.id || user._id || null);
          setPatientEmail(user.email || "");
          setForm(f => ({ ...f, patientName: user.name || "", patientEmail: user.email || "" }));

          if (user.email && id) {
            try {
              const dupRes = await fetch(`${BACKEND}/api/patients/check-duplicate/${user.email}/${id}`);
              const dupData = await dupRes.json();
              if (dupData.success && dupData.isDuplicate) {
                setDuplicateStatus(dupData.status);
              }
            } catch { }
          }
        }
      })
      .catch(() => { });
  }, [id]);

  const slots = Array.isArray(doctor?.availableSlots)
    ? doctor.availableSlots
    : doctor?.availableSlots ? [doctor.availableSlots]
      : ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

  const today = new Date().toISOString().split("T")[0];

  // ── Step 1: Request ───────────────────────────────────────────────────
  const handleRequestAppointment = async (e) => {
    e.preventDefault();
    if (!form.timeSlot) { toast.error("Please select a time slot.", { position: "top-center" }); return; }

    setRequesting(true);
    try {
      const res = await fetch(`${BACKEND}/api/appointments/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: id, doctorName: doctor.doctorName,
          patientId, patientEmail: form.patientEmail, patientName: form.patientName,
          date: form.date, timeSlot: form.timeSlot, problem: form.problem,
        }),
      });
      const data = await res.json();

      if (data.isDuplicate) {
        setDuplicateStatus(data.status);
        return;
      }

      if (data.success) {
        setAppointmentRequested(true);
        setPendingAppointmentId(data.appointmentId);
        toast.success("Request sent! Waiting for doctor approval.", { position: "top-center" });
      } else {
        toast.error(data.message || "Failed to send request.", { position: "top-center" });
      }
    } catch {
      toast.error("Network error. Please try again.", { position: "top-center" });
    } finally {
      setRequesting(false);
    }
  };

  // ── Step 2: Payment ───────────────────────────────────────────────────
  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      const usdAmount = doctor.consultationFee;
      const bdtAmount = convertToBDT(usdAmount);

      const res = await fetch(`${BACKEND}/api/appointments/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: id,
          doctorName: doctor.doctorName,
          patientId,
          patientEmail: form.patientEmail,
          patientName: form.patientName,
          date: form.date,
          timeSlot: form.timeSlot,
          problem: form.problem,
          consultationFee: doctor.consultationFee,
          amountUSD: usdAmount,
          amountBDT: bdtAmount,
          currency: "USD"
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Failed to start payment.", { position: "top-center" });
      }
    } catch {
      toast.error("Network error. Please try again.", { position: "top-center" });
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
        <p className="text-slate-500 font-semibold text-sm">Loading doctor details...</p>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-md">
        <p className="text-slate-700 font-bold text-lg">Doctor not found</p>
        <a href="/find-doctors" className="inline-flex items-center gap-2 mt-6 text-blue-600 font-semibold text-sm">
          <FaArrowLeft /> Back to Find Doctors
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
          <a href="/find-doctors"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold mb-4 transition-all group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Find Doctors
          </a>
          <h1 className="text-3xl font-black tracking-tight text-white">Book Your Appointment</h1>
          <p className="text-slate-400 text-sm mt-1">Schedule a consultation in just a few clicks</p>
        </div>
      </div>

      {cancelled && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-b border-red-200 px-6 py-4 text-center">
          <p className="text-red-600 font-semibold text-sm">⚠️ Payment was cancelled. You can try again below.</p>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-5 gap-8">

        {/* Doctor Card */}
        <aside className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden sticky top-8">
            <div className="relative h-56">
              <Image src={doctor.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600"}
                alt={doctor.doctorName} width={400} height={300} unoptimized className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg">
                <FaCheckCircle className="text-[9px]" /> Verified
              </div>
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-lg">
                <FaStar className="text-amber-400" /> {doctor.rating || "4.9"}
                <span className="text-slate-400">({doctor.reviews || "120"})</span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-900">{doctor.doctorName}</h2>
              <p className="text-blue-600 text-sm font-semibold mt-0.5">{doctor.specialization}</p>
              <div className="space-y-2.5 border-t border-slate-100 pt-4 mt-4">
                <div className="flex items-center gap-3 text-sm text-slate-600"><FaHospital className="text-blue-500" /> {doctor.hospitalName}</div>
                {doctor.degrees && <div className="flex items-center gap-3 text-sm text-slate-600"><FaUserMd className="text-blue-500" /> {doctor.degrees}</div>}
                {doctor.experience && <div className="flex items-center gap-3 text-sm text-slate-600"><FaRegClock className="text-blue-500" /> {doctor.experience} yrs experience</div>}
              </div>

              {/* Updated Fee Section with Both Currencies */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Consultation Fee</span>
                <div className="mt-2 space-y-1">
                  <div className="text-2xl font-black text-slate-900">
                    ${doctor.consultationFee} <span className="text-sm font-semibold text-slate-400">USD</span>
                  </div>
                  <div className="text-lg font-bold text-slate-700">
                    ৳{convertToBDT(doctor.consultationFee)} <span className="text-sm font-semibold text-slate-400">BDT</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="font-bold">💱</span> 1 USD = ৳110 BDT
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <FaLock className="text-emerald-500 text-[9px]" /> Secure Stripe
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-3">
          <form onSubmit={appointmentRequested ? handlePayment : handleRequestAppointment}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">

            {/* Duplicate banner */}
            <AnimatePresence>
              {duplicateStatus && (
                <DuplicateBanner
                  status={duplicateStatus}
                  onGoToDashboard={() => window.location.href = "/dashboard/patient/appointments"}
                />
              )}
            </AnimatePresence>

            {/* Form header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FaUserMd className="text-blue-600 text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Patient Information</h3>
                <p className="text-slate-400 text-xs">Please fill in your details below</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaUser className="text-blue-500 text-xs" /> Full Name
              </label>
              <input type="text" required value={form.patientName}
                onChange={e => setForm({ ...form, patientName: e.target.value })}
                disabled={appointmentRequested || !!duplicateStatus}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white transition-all disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaEnvelope className="text-blue-500 text-xs" /> Email Address
              </label>
              <input type="email" required value={form.patientEmail}
                onChange={e => setForm({ ...form, patientEmail: e.target.value })}
                disabled={appointmentRequested || !!duplicateStatus}
                placeholder="john@email.com"
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white transition-all disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaRegCalendar className="text-blue-500 text-xs" /> Appointment Date
              </label>
              <input type="date" required min={today} value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                disabled={appointmentRequested || !!duplicateStatus}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white transition-all disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaClock className="text-blue-500 text-xs" /> Select Time Slot
              </label>
              <div className="grid grid-cols-3 gap-3">
                {slots.map(slot => (
                  <motion.button key={slot} type="button"
                    disabled={appointmentRequested || !!duplicateStatus}
                    whileHover={{ scale: (appointmentRequested || duplicateStatus) ? 1 : 1.03 }}
                    whileTap={{ scale: (appointmentRequested || duplicateStatus) ? 1 : 0.97 }}
                    onClick={() => setForm({ ...form, timeSlot: slot })}
                    className={`py-3.5 px-3 rounded-2xl text-sm font-bold border-2 transition-all ${form.timeSlot === slot
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg shadow-blue-500/30"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}>
                    {slot}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaNotesMedical className="text-blue-500 text-xs" /> Symptoms / Reason
              </label>
              <textarea rows={4} required value={form.problem}
                onChange={e => setForm({ ...form, problem: e.target.value })}
                disabled={appointmentRequested || !!duplicateStatus}
                placeholder="Describe your symptoms..."
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white transition-all resize-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Updated Booking Summary with Both Currencies */}
            {form.date && form.timeSlot && !duplicateStatus && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 rounded-2xl p-5 space-y-2">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" /> Booking Summary
                </p>
                {[
                  ["Doctor", doctor.doctorName],
                  ["Date", form.date],
                  ["Time", form.timeSlot]
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-bold text-slate-700">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-3 border-t-2 border-blue-200 mt-1">
                  <span className="font-black text-slate-700">Total</span>
                  <div className="text-right">
                    <div className="font-black text-blue-600 text-lg">${doctor.consultationFee} USD</div>
                    <div className="font-semibold text-blue-500 text-sm">৳{convertToBDT(doctor.consultationFee)} BDT</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 bg-white/50 px-3 py-1.5 rounded-lg mt-2">
                  <span>💱 Exchange Rate</span>
                  <span className="font-bold">1 USD = ৳110 BDT</span>
                </div>
              </motion.div>
            )}

            {/* Waiting for doctor */}
            {appointmentRequested && !doctorAccepted && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="text-amber-500 animate-spin flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-black text-amber-900">Waiting for Doctor Response</p>
                    <p className="text-xs text-amber-600">Checking every 3 seconds automatically...</p>
                  </div>
                </div>
                <ul className="text-xs text-amber-700 space-y-1 ml-1">
                  <li>✓ Doctor reviews your request</li>
                  <li>✓ You'll be notified on approval</li>
                  <li>✓ Payment button unlocks automatically</li>
                </ul>
              </motion.div>
            )}

            {/* Doctor accepted */}
            {appointmentRequested && doctorAccepted && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-black text-emerald-900">🎉 Appointment Approved!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Doctor accepted your request. Proceed to secure payment.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Updated Submit Button with Both Currencies */}
            {!duplicateStatus && (
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={(!form.timeSlot && !appointmentRequested) || requesting || paying || (appointmentRequested && !doctorAccepted)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-3">
                {requesting ? <><Loader2 size={18} className="animate-spin" /> Sending Request...</>
                  : paying ? <><Loader2 size={18} className="animate-spin" /> Redirecting to Payment...</>
                    : appointmentRequested && !doctorAccepted ? <><Clock size={18} className="animate-pulse" /> Waiting for Doctor...</>
                      : doctorAccepted ? (
                        <>
                          <FaCreditCard />
                          <span>Proceed to Payment — ${doctor.consultationFee} USD</span>
                          <span className="text-xs opacity-75 bg-white/20 px-2 py-0.5 rounded-full">
                            ৳{convertToBDT(doctor.consultationFee)} BDT
                          </span>
                        </>
                      )
                      : <><Clock size={18} /> Request Appointment</>
                }
              </motion.button>
            )}

            <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5"><FaLock className="text-emerald-500" /> Secure Booking</div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5"><FaShieldAlt className="text-blue-500" /> Doctor Approval</div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5"><FaCreditCard className="text-purple-500" /> Stripe Payment</div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>💱</span> 1 USD = ৳110 BDT
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}