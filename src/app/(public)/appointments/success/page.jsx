"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle, FaCalendarAlt, FaClock,
  FaUserMd, FaHome, FaReceipt, FaTimesCircle,
  FaDollarSign, FaPhone, FaMapMarkerAlt
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export default function AppointmentSuccessPage() {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);

  useEffect(() => {
    const params        = new URLSearchParams(window.location.search);
    const appointmentId = params.get("appointmentId");
    const sessionId     = params.get("session_id");

    if (!appointmentId || !sessionId) {
      setError(true);
      setLoading(false);
      return;
    }

    const confirm = async () => {
      try {
        const res  = await fetch(`${BACKEND}/api/appointments/confirm/${appointmentId}`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (data.success) {
          setAppointment(data.appointment);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Confirmation error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="animate-spin text-[#00A3E0] mx-auto relative" size={48} />
        </div>
        <p className="text-slate-600 font-bold text-sm">Confirming your payment...</p>
        <p className="text-slate-400 text-xs">Please wait, do not close this page.</p>
        <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto mt-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col items-center justify-center gap-6 px-4 py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center"
        >
          <FaTimesCircle className="text-red-500 text-5xl" />
        </motion.div>

        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black text-slate-900 mb-3">Something Went Wrong</h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            We couldn't confirm your appointment. If you were charged, your money will be refunded to your original payment method within 3-5 business days. Please contact support for assistance.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-w-md w-full">
          <p className="text-xs font-bold text-red-700 mb-2">⚠️ What to do next:</p>
          <ul className="text-xs text-red-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-red-700 font-bold">•</span>
              <span>Check your email for transaction details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-700 font-bold">•</span>
              <span>Contact our support team if funds were deducted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-700 font-bold">•</span>
              <span>Try booking again with a different payment method</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3 w-full max-w-md mt-4">
          <Link href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-xl transition-colors">
            <FaHome className="text-[11px]" /> Go Home
          </Link>
          <Link href="/find-doctors"
            className="flex-1 flex items-center justify-center gap-2 bg-[#00A3E0] hover:bg-[#0082b3] text-white font-bold text-xs py-3.5 rounded-xl transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center relative">
              <FaCheckCircle className="text-emerald-500 text-6xl" />
            </div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-3">Appointment Confirmed! ✨</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your payment was successful and your appointment is booked.
            {appointment?.patientEmail && (
              <>
                {" "}A confirmation email has been sent to{" "}
                <span className="font-bold text-slate-800">{appointment.patientEmail}</span>
              </>
            )}
          </p>
        </motion.div>

        {/* Main Details Card */}
        {appointment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden mb-6"
          >
            {/* Doctor Info Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <FaUserMd className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Dr. {appointment.doctorName}</h2>
                  <p className="text-xs text-slate-500 mt-1">Confirmed & Scheduled</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <FaReceipt className="text-[#00A3E0]" /> Booking Details
              </h3>

              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FaCalendarAlt className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                      <p className="text-sm font-bold text-slate-900">{appointment.appointmentDate}</p>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <FaClock className="text-purple-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                      <p className="text-sm font-bold text-slate-900">{appointment.appointmentTime}</p>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">📋</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Reason for Visit</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{appointment.symptoms}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FaDollarSign className="text-emerald-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Amount Paid</p>
                      <div className="text-sm font-black text-emerald-700 mt-1">
                        ৳{appointment.amount ? (appointment.amount * 120).toFixed(0) : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 font-bold">USD</p>
                    <p className="text-lg font-black text-emerald-700">
                      ${appointment.amount || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-6">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-3.5 py-2 rounded-full uppercase tracking-wider">
                  <FaCheckCircle className="text-[10px]" /> Confirmed
                </span>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-3.5 py-2 rounded-full uppercase tracking-wider">
                  <FaCheckCircle className="text-[10px]" /> Payment Received
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6"
        >
          <h4 className="text-xs font-black text-blue-900 uppercase mb-3">📧 What happens next?</h4>
          <ul className="text-xs text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>A confirmation email with details will be sent shortly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Check your email for appointment reminders 24 hours before</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Contact the hospital if you need to reschedule</span>
            </li>
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <Link href="/"
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs py-4 rounded-xl transition-all duration-300 hover:shadow-md">
            <FaHome className="text-[12px]" /> Go Home
          </Link>
          <Link href="/dashboard/patient/my-appointments"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00A3E0] to-[#0082b3] hover:from-[#0082b3] hover:to-[#005d8a] text-white font-black text-xs py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
            <FaCalendarAlt className="text-[12px]" /> View My Appointments
          </Link>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 pt-6 border-t border-slate-200"
        >
          <p className="text-[11px] text-slate-500 font-semibold">
            Need help? Contact us at{" "}
            <a href="mailto:support@medicareconnect.com" className="text-[#00A3E0] hover:underline font-bold">
              support@medicareconnect.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}