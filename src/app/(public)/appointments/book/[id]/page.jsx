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
import { Loader2, Clock, AlertCircle, CheckCircle2, Ban } from "lucide-react";
import { toast } from "react-toastify";

const BACKEND = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export default function BookingPage({ params }) {
  const { id } = use(params);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [appointmentRequested, setAppointmentRequested] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null);
  const [doctorAccepted, setDoctorAccepted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictedUntil, setRestrictedUntil] = useState(null);
  const [restrictionReason, setRestrictionReason] = useState("");
  const [restrictionMessage, setRestrictionMessage] = useState("");

  const [form, setForm] = useState({
    patientName: "",
    patientEmail: "",
    date: "",
    timeSlot: "",
    problem: "",
  });

  // Poll for doctor acceptance
  useEffect(() => {
    if (!appointmentRequested || !pendingAppointmentId) return;

    const pollInterval = setInterval(async () => {
      try {
        setCheckingStatus(true);
        const res = await fetch(`${BACKEND}/api/appointments/check/${pendingAppointmentId}`);
        const data = await res.json();

        if (data.success) {
          if (data.status === "confirmed") {
            setDoctorAccepted(true);
            toast.success("✅ Doctor accepted your request! Ready to pay.", { position: "top-center" });
            clearInterval(pollInterval);
          } else if (data.status === "rejected") {
            toast.error(`❌ Doctor rejected: ${data.appointment?.rejectionReason || "No reason provided"}`, { position: "top-center" });
            setAppointmentRequested(false);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error("Status check error:", err);
      } finally {
        setCheckingStatus(false);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [appointmentRequested, pendingAppointmentId]);

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

          // CHECK RESTRICTION AND SHOW TOAST
          checkUserRestriction(user.email);
        }
      })
      .catch(() => {});
  }, []);

  // Check if user is restricted and show toast
  const checkUserRestriction = async (email) => {
    try {
      const res = await fetch(`${BACKEND}/api/appointments/check-restriction/${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.success) {
        if (data.status === "banned") {
          setIsRestricted(true);
          setRestrictionReason(data.reason || "Banned");
          setRestrictionMessage(data.message || "Your account has been permanently banned.");
          
          toast.error(`🚫 ${data.message || "Your account has been permanently banned. Please contact support."}`, {
            position: "top-center",
            autoClose: false,
            closeOnClick: true,
            draggable: false,
          });
          
        } else if (data.status === "restricted") {
          setIsRestricted(true);
          setRestrictedUntil(data.until);
          setRestrictionReason(data.reason || "Restricted");
          setRestrictionMessage(data.message || "Your account has been restricted.");
          
          const untilDate = data.until ? new Date(data.until).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : "unknown date";
          
          toast.warning(`⚠️ ${data.message || `Your account is restricted until ${untilDate}. You cannot book appointments.`}`, {
            position: "top-center",
            autoClose: false,
            closeOnClick: true,
            draggable: false,
          });
        }
      }
    } catch (err) {
      console.error("Restriction check error:", err);
    }
  };

  const slots = Array.isArray(doctor?.availableSlots)
    ? doctor.availableSlots
    : doctor?.availableSlots
      ? [doctor.availableSlots]
      : ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

  const today = new Date().toISOString().split("T")[0];

  // =========================================================================
  // FIXED: REQUEST APPOINTMENT - Creates ONE appointment
  // =========================================================================
  const handleRequestAppointment = async (e) => {
    e.preventDefault();
    if (!form.timeSlot) {
      toast.error("Please select a time slot", { position: "top-center" });
      return;
    }
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
        toast.success("📨 Request sent! Waiting for doctor approval...", { position: "top-center" });
        setAppointmentRequested(true);
        setPendingAppointmentId(data.appointmentId);
      } else {
        // Check if it's a restriction error
        if (data.status === "restricted") {
          const untilDate = data.until ? new Date(data.until).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : "unknown date";
          
          const message = `You are restricted from booking until ${untilDate}.`;
          toast.error(message, { 
            position: "top-center",
            autoClose: false,
            closeOnClick: true,
            draggable: false,
          });
          setIsRestricted(true);
          setRestrictedUntil(data.until);
          setRestrictionMessage(data.message || message);
          
        } else if (data.status === "banned") {
          const message = "🚫 Your account is permanently banned. Please contact support.";
          toast.error(message, { 
            position: "top-center",
            autoClose: false,
            closeOnClick: true,
            draggable: false,
          });
          setIsRestricted(true);
          setRestrictionMessage(data.message || message);
          
        } else if (data.status === 409) {
          // Duplicate appointment
          toast.warning("⚠️ You already have a pending appointment with this doctor at this time.", { 
            position: "top-center" 
          });
          // If there's an existing appointment ID, use it
          if (data.appointmentId) {
            setPendingAppointmentId(data.appointmentId);
            setAppointmentRequested(true);
          }
        } else {
          toast.error(data.message || "Failed to request appointment.", { position: "top-center" });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.", { position: "top-center" });
    } finally {
      setRequesting(false);
    }
  };

  // =========================================================================
  // FIXED: Payment Handler - Uses existing appointment ID
  // =========================================================================
  const handlePayment = async (e) => {
    e.preventDefault();
    
    // ✅ Check if we have a pending appointment ID
    if (!pendingAppointmentId) {
      toast.error("No appointment found. Please request an appointment first.", { 
        position: "top-center" 
      });
      return;
    }

    setPaying(true);

    try {
      // ✅ USE THE EXISTING APPOINTMENT ID
      const res = await fetch(`${BACKEND}/api/appointments/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: pendingAppointmentId, // ✅ Pass existing appointment ID
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
        toast.error(data.message || "Failed to create payment.", { 
          position: "top-center" 
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.", { 
        position: "top-center" 
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-500 font-semibold text-sm">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <FaUserMd className="text-red-400 text-5xl mx-auto mb-4" />
          <p className="text-slate-700 font-bold text-lg">Doctor not found</p>
          <a href="/find-doctors" 
             className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-semibold text-sm">
            <FaArrowLeft /> Back to Find Doctors
          </a>
        </div>
      </div>
    );
  }

  // SHOW RESTRICTION MESSAGE PAGE
  if (isRestricted) {
    const isBanned = restrictionReason.toLowerCase().includes("banned") || restrictionMessage.toLowerCase().includes("banned");
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-16">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-6"
          >
            <div className={`w-24 h-24 rounded-full ${isBanned ? 'bg-red-100' : 'bg-orange-100'} flex items-center justify-center`}>
              <Ban className={`${isBanned ? 'text-red-500' : 'text-orange-500'} text-5xl`} />
            </div>
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-3">
              {isBanned ? 'Account Banned' : 'Booking Restricted'}
            </h1>
            <p className="text-slate-600 text-sm">
              {isBanned 
                ? 'Your account has been permanently banned.'
                : 'Your account has booking restrictions.'
              }
              {restrictedUntil && !isBanned && (
                <> Your restriction will be lifted on <span className="font-bold">{new Date(restrictedUntil).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>.</>
              )}
            </p>
          </div>

          <div className={`${isBanned ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border rounded-2xl p-5 mb-6`}>
            <p className={`text-sm ${isBanned ? 'text-red-700' : 'text-orange-700'} font-bold mb-3`}>
              {isBanned ? 'Why is this happening?' : 'Restriction Details'}
            </p>
            <p className={`text-xs ${isBanned ? 'text-red-600' : 'text-orange-600'}`}>
              {restrictionMessage || (isBanned 
                ? 'Your account has been permanently banned by our admin team for policy violations.'
                : 'Your account has been restricted by our admin team for policy violations. Please contact support for more information.'
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a href="/find-doctors"
              className="text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-xl transition-colors">
              Back to Find Doctors
            </a>
            <a href="/contact"
              className={`text-center ${isBanned ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white font-bold text-xs py-3.5 rounded-xl transition-colors`}>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
          <a href="/find-doctors"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold mb-4 transition-all">
            <FaArrowLeft className="text-[10px]" /> Back to Find Doctors
          </a>
          <h1 className="text-3xl font-black tracking-tight text-white">Book Your Appointment</h1>
          <p className="text-slate-400 text-sm mt-1">Schedule a consultation in just a few clicks</p>
        </div>
      </div>

      {cancelled && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/90 backdrop-blur-sm border-b border-red-200 px-6 py-4 text-center">
          <p className="text-red-600 font-semibold text-sm flex items-center justify-center gap-2">
            <span>⚠️</span>
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
            className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden sticky top-8">

            <div className="relative h-56 bg-gradient-to-br from-blue-100 to-indigo-100">
              <Image
                src={doctor.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600"}
                alt={doctor.doctorName} width={400} height={300} unoptimized
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg">
                <FaCheckCircle className="text-[9px]" /> Verified
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-black text-slate-900">Dr. {doctor.doctorName}</h2>
              <p className="text-blue-600 text-sm font-semibold mt-0.5">{doctor.specialization}</p>

              <div className="space-y-3 border-t border-slate-100 pt-4 mt-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FaHospital className="text-blue-500" />
                  <span>{doctor.hospitalName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FaRegClock className="text-blue-500" />
                  <span>{doctor.experience} years experience</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-bold uppercase">Consultation Fee</span>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  ৳{(doctor.consultationFee * 120).toFixed(0)}
                </div>
                <div className="text-xs text-slate-400">
                  (${doctor.consultationFee} USD)
                </div>
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3">
          <form onSubmit={appointmentRequested ? handlePayment : handleRequestAppointment}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">

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
              <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
              <input type="text" required value={form.patientName}
                onChange={e => setForm({ ...form, patientName: e.target.value })}
                disabled={appointmentRequested}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-blue-400 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
              <input type="email" required value={form.patientEmail}
                onChange={e => setForm({ ...form, patientEmail: e.target.value })}
                disabled={appointmentRequested}
                placeholder="john@email.com"
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-blue-400 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Appointment Date</label>
              <input type="date" required min={today} value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                disabled={appointmentRequested}
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-blue-400 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>

            {/* Time Slot */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 uppercase">Select Time Slot</label>
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <motion.button
                    key={slot}
                    type="button"
                    disabled={appointmentRequested}
                    onClick={() => setForm({ ...form, timeSlot: slot })}
                    className={`py-3.5 px-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                      form.timeSlot === slot
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg"
                        : "bg-slate-50/80 text-slate-600 border-slate-100 hover:border-blue-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    }`}>
                    {slot}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Symptoms / Reason</label>
              <textarea rows={4} required value={form.problem}
                onChange={e => setForm({ ...form, problem: e.target.value })}
                disabled={appointmentRequested}
                placeholder="Describe your symptoms..."
                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-blue-400 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed resize-none" />
            </div>

            {/* Booking Summary */}
            {form.date && form.timeSlot && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                <p className="text-xs font-black text-slate-700 uppercase mb-3">Booking Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Doctor</span>
                    <span className="font-bold text-slate-700">Dr. {doctor.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Specialization</span>
                    <span className="font-bold text-slate-700">{doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date</span>
                    <span className="font-bold text-slate-700">{form.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time</span>
                    <span className="font-bold text-slate-700">{form.timeSlot}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-blue-200 mt-3">
                    <span className="font-black text-slate-700">Total Amount</span>
                    <div className="text-right">
                      <div className="font-black text-blue-600">
                        ৳{(doctor.consultationFee * 120).toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">
                        (${doctor.consultationFee} USD)
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Waiting Status */}
            {appointmentRequested && !doctorAccepted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <Clock className="text-amber-600 relative animate-spin" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-900">⏳ Doctor Review in Progress</p>
                    <p className="text-xs text-amber-700 mt-0.5">Waiting for doctor approval...</p>
                  </div>
                </div>
                <div className="bg-white/50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-amber-800 font-semibold">What happens next:</p>
                  <ul className="text-xs text-amber-700 space-y-1.5 ml-2">
                    <li className="flex items-start gap-2">
                      <span className="text-lg leading-none">✓</span>
                      <span>Doctor reviews your appointment request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg leading-none">✓</span>
                      <span>You'll receive notification when approved</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg leading-none">✓</span>
                      <span>Payment button will unlock automatically</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Accepted Status */}
            {appointmentRequested && doctorAccepted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <CheckCircle2 className="text-emerald-600 relative" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900">✨ Approved!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Doctor accepted your request</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-800 bg-white/50 rounded-2xl p-3">
                  🎉 Your appointment has been approved! Proceed to secure payment to confirm your booking.
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button 
              type="submit"
              disabled={(!form.timeSlot && !appointmentRequested) || requesting || paying || (appointmentRequested && !doctorAccepted)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3">
              {requesting ? (
                <><Loader2 size={18} className="animate-spin" /> Sending Request...</>
              ) : paying ? (
                <><Loader2 size={18} className="animate-spin" /> Redirecting to Payment...</>
              ) : appointmentRequested && !doctorAccepted ? (
                <><Clock size={18} className="animate-pulse" /> Waiting for Doctor...</>
              ) : doctorAccepted ? (
                <><FaCreditCard className="text-sm" /> Proceed to Payment — ৳{(doctor.consultationFee * 120).toFixed(0)}</>
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
                <AlertCircle size={10} className="text-blue-500" />
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