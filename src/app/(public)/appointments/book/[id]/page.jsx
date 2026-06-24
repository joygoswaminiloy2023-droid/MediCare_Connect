"use client";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaStar, FaCheckCircle, FaHospital, FaCalendarAlt,
  FaClock, FaUser, FaNotesMedical, FaArrowLeft, FaLock,
  FaShieldAlt, FaCreditCard, FaRegClock, FaRegCalendar,
  FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt
} from "react-icons/fa";
import { Loader2, Clock, AlertCircle } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
console.log("BACKEND URL:", BACKEND);

export default function BookingPage({ params }) {
  const { id } = use(params);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [appointmentRequested, setAppointmentRequested] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null);
  const [patientId, setPatientId] = useState(null);

  const [form, setForm] = useState({
    patientName: "",
    patientEmail: "",
    date: "",
    timeSlot: "",
    problem: "",
  });

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

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then(r => r.json())
      .then(data => {
        const user = data?.user || data?.data?.user;
        if (user) {
          setPatientId(user.id || user._id || null);
          setForm(f => ({
            ...f,
            patientName: user.name || "",
            patientEmail: user.email || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const slots = Array.isArray(doctor?.availableSlots)
    ? doctor.availableSlots
    : doctor?.availableSlots
      ? [doctor.availableSlots]
      : ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

  const today = new Date().toISOString().split("T")[0];

  const handleRequestAppointment = async (e) => {
    e.preventDefault();
    if (!form.timeSlot) return alert("Please select a time slot.");
    setRequesting(true);

    try {
      const res = await fetch(`${BACKEND}/api/appointments/request`, {
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
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Request sent! Waiting for doctor approval...");
        setAppointmentRequested(true);
        setPendingAppointmentId(data.appointmentId);
      } else {
        alert(data.message || "Failed to request appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);

    try {
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
        }),
      });

      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Failed to start payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserMd className="text-red-400 text-3xl" />
          </div>
          <p className="text-slate-700 font-bold text-lg">Doctor not found</p>
          <a href="/find-doctors" 
             className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
            <FaArrowLeft className="text-xs" /> Back to Find Doctors
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
          <a href="/find-doctors"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold mb-4 transition-all hover:gap-3 group">
            <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition-transform" /> Back to Find Doctors
          </a>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Book Your Appointment</h1>
              <p className="text-slate-400 text-sm mt-1">Schedule a consultation in just a few clicks</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-xs font-semibold">Secure Booking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancelled banner */}
      {cancelled && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/90 backdrop-blur-sm border-b border-red-200 px-6 py-4 text-center relative">
          <p className="text-red-600 font-semibold text-sm flex items-center justify-center gap-2">
            <span className="text-lg">⚠️</span>
            Payment was cancelled. You can try again below.
          </p>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-5 gap-8">

        {/* Doctor Info */}
        <aside className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden sticky top-8 hover:shadow-2xl transition-shadow duration-300">

            <div className="relative h-56 bg-gradient-to-br from-blue-100 to-indigo-100">
              <Image
                src={doctor.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600"}
                alt={doctor.doctorName} width={400} height={300} unoptimized
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute top-4 right-4 bg-emerald-500 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase shadow-lg backdrop-blur-sm">
                <FaCheckCircle className="text-[9px]" /> Verified
              </div>
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-lg">
                <FaStar className="text-amber-400 text-sm" />
                <span>{doctor.rating || "4.9"}</span>
                <span className="text-slate-400 text-[10px]">({doctor.reviews || "120"} reviews)</span>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-bold shadow-lg">
                <span className="text-emerald-600">●</span> Available Today
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-black text-slate-900">{doctor.doctorName}</h2>
                <p className="text-blue-600 text-sm font-semibold mt-0.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  {doctor.specialization}
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FaHospital className="text-blue-500 text-sm" />
                  <span>{doctor.hospitalName}</span>
                </div>
                {doctor.degrees && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <FaUserMd className="text-blue-500 text-sm" />
                    <span>{doctor.degrees}</span>
                  </div>
                )}
                {doctor.experience && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <FaRegClock className="text-blue-500 text-sm" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Consultation Fee</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">
                      ${doctor.consultationFee}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 ml-1">USD</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
                  <FaLock className="text-emerald-500 text-[10px]" />
                  <span>Secure payment via Stripe</span>
                </div>
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }} 
          className="lg:col-span-3">
          <form onSubmit={appointmentRequested ? handlePayment : handleRequestAppointment}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FaUserMd className="text-blue-600 text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Patient Information</h3>
                <p className="text-slate-400 text-xs">Please fill in your details</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaUser className="text-blue-500 text-xs" /> Full Name
              </label>
              <input type="text" required value={form.patientName}
                onChange={e => setForm({ ...form, patientName: e.target.value })}
                disabled={appointmentRequested}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-100/50 transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaEnvelope className="text-blue-500 text-xs" /> Email Address
              </label>
              <input type="email" required value={form.patientEmail}
                onChange={e => setForm({ ...form, patientEmail: e.target.value })}
                disabled={appointmentRequested}
                placeholder="john@email.com"
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-100/50 transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaRegCalendar className="text-blue-500 text-xs" /> Appointment Date
              </label>
              <input type="date" required min={today} value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                disabled={appointmentRequested}
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-100/50 transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Time Slot */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaClock className="text-blue-500 text-xs" /> Select Time Slot
              </label>
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot, index) => (
                  <motion.button
                    key={slot}
                    type="button"
                    disabled={appointmentRequested}
                    whileHover={{ scale: appointmentRequested ? 1 : 1.03 }}
                    whileTap={{ scale: appointmentRequested ? 1 : 0.97 }}
                    onClick={() => setForm({ ...form, timeSlot: slot })}
                    className={`py-3.5 px-3 rounded-2xl text-sm font-bold border-2 transition-all duration-300 ${
                      form.timeSlot === slot
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg shadow-blue-500/30"
                        : "bg-slate-50/80 text-slate-600 border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-lg hover:shadow-blue-100/30 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    }`}>
                    {slot}
                  </motion.button>
                ))}
              </div>
              {!form.timeSlot && (
                <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-1">
                  <span>⚠️</span> Please select a time slot to continue
                </p>
              )}
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <FaNotesMedical className="text-blue-500 text-xs" /> Symptoms / Reason for Visit
              </label>
              <textarea rows={4} required value={form.problem}
                onChange={e => setForm({ ...form, problem: e.target.value })}
                disabled={appointmentRequested}
                placeholder="Briefly describe your symptoms or reason for visit..."
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-100/50 transition-all duration-300 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Booking Summary */}
            {form.date && form.timeSlot && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-200/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-blue-600 text-sm" />
                  </div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Booking Summary</p>
                </div>
                <div className="space-y-2">
                  {[
                    ["Doctor", doctor.doctorName],
                    ["Specialization", doctor.specialization],
                    ["Date", form.date],
                    ["Time", form.timeSlot],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-bold text-slate-700">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm pt-3 border-t-2 border-blue-200/50 mt-2">
                  <span className="font-black text-slate-700">Total</span>
                  <span className="font-black text-blue-600 text-lg">${doctor.consultationFee} USD</span>
                </div>
              </motion.div>
            )}

            {/* Request Status */}
            {appointmentRequested && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-600" size={20} />
                  <p className="text-sm font-bold text-emerald-700">Request Sent Successfully!</p>
                </div>
                <p className="text-xs text-emerald-600">Your appointment request has been sent to the doctor. Once approved, you can proceed to payment.</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={(!form.timeSlot && !appointmentRequested) || requesting || paying}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-3">
              {requesting ? (
                <><Loader2 size={18} className="animate-spin" /> Sending Request...</>
              ) : paying ? (
                <><Loader2 size={18} className="animate-spin" /> Redirecting to Payment...</>
              ) : appointmentRequested ? (
                <><FaCreditCard className="text-sm" /> Proceed to Payment — ${doctor.consultationFee}</>
              ) : (
                <><Clock size={18} /> Request Appointment</>
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <FaLock className="text-emerald-500 text-[10px]" />
                Secure Booking
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1.5">
                <FaShieldAlt className="text-blue-500 text-[10px]" />
                Doctor Approval
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1.5">
                <FaCreditCard className="text-purple-500 text-[10px]" />
                Stripe Payment
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}