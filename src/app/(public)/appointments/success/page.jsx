"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle, FaCalendarAlt, FaClock,
  FaUserMd, FaHome, FaReceipt, FaTimesCircle
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00A3E0]" size={36} />
        <p className="text-slate-500 font-bold text-sm">Confirming your payment...</p>
        <p className="text-slate-400 text-xs">Please wait, do not close this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <FaTimesCircle className="text-red-500 text-4xl" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Something went wrong</h1>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          We couldn't confirm your appointment. If you were charged, please contact support.
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/"
            className="bg-slate-100 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
            Go Home
          </Link>
          <Link href="/find-doctors"
            className="bg-[#00A3E0] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#0082b3] transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
            <FaCheckCircle className="text-emerald-500 text-5xl" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 mb-2">Appointment Confirmed!</h1>
          <p className="text-slate-500 text-sm">
            Your payment was successful and your appointment is booked.
            {appointment?.patientEmail && (
              <> Confirmation sent to{" "}
                <span className="font-bold text-slate-700">{appointment.patientEmail}</span>.
              </>
            )}
          </p>
        </motion.div>

        {/* Details Card */}
        {appointment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6"
          >
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <FaReceipt className="text-[#00A3E0]" /> Booking Details
            </h2>

            <div className="space-y-3">
              {[
                { icon: FaUserMd,      label: "Doctor",   value: appointment.doctorName },
                { icon: FaCalendarAlt, label: "Date",     value: appointment.appointmentDate },
                { icon: FaClock,       label: "Time",     value: appointment.appointmentTime },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Icon className="text-[#00A3E0] text-[11px]" /> {label}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{value}</span>
                </div>
              ))}

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500">Symptoms</span>
                <span className="text-xs font-bold text-slate-800 max-w-[200px] text-right">
                  {appointment.symptoms}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-black text-slate-700">Amount Paid</span>
                <span className="text-base font-black text-emerald-600">
                  ${appointment.amount || "—"} USD
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1.5 rounded-full">
                <FaCheckCircle className="text-[9px]" /> Confirmed
              </span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-3 py-1.5 rounded-full">
                <FaCheckCircle className="text-[9px]" /> Paid
              </span>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <Link href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-xl transition-colors">
            <FaHome className="text-[11px]" /> Go Home
          </Link>
          <Link href="/dashboard/patient"
            className="flex-1 flex items-center justify-center gap-2 bg-[#00A3E0] hover:bg-[#0082b3] text-white font-bold text-xs py-3.5 rounded-xl transition-colors">
            <FaCalendarAlt className="text-[11px]" /> My Appointments
          </Link>
        </motion.div>
      </div>
    </div>
  );
}