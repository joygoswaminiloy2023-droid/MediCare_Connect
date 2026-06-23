"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Heart, Stethoscope, ArrowRight, AlertCircle, Star } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function PatientDashboardOverview() {
  const [upcomingAppointments, setUpcoming] = useState([]);
  const [appointmentHistory, setHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = authClient.useSession();
  const patientEmail = session?.user?.email;

  useEffect(() => {
    if (!patientEmail) return;

    Promise.all([
      fetch(`${BACKEND}/api/patients/upcoming/${patientEmail}`).then(r => r.json()),
      fetch(`${BACKEND}/api/patients/history/${patientEmail}`).then(r => r.json()),
      fetch(`${BACKEND}/api/patients/payments/${patientEmail}`).then(r => r.json()),
      fetch(`${BACKEND}/api/patients/favorite-doctors/${patientEmail}`).then(r => r.json()),
    ])
      .then(([apt, hist, pay, docs]) => {
        if (apt.success) setUpcoming(apt.appointments || []);
        if (hist.success) setHistory(hist.appointments || []);
        if (pay.success) setPayments(pay.payments || []);
        if (docs.success) setFavoriteDoctors(docs.doctors || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientEmail]);

  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAppointments = payments.filter(p => p.paymentStatus === "paid").length;
  const totalAppointments = appointmentHistory.length;

  const appointmentStatusData = [
    { name: "Upcoming", count: upcomingAppointments.length },
    { name: "Completed", count: appointmentHistory.filter(a => a.appointmentStatus === "completed").length },
    { name: "Cancelled", count: appointmentHistory.filter(a => a.appointmentStatus === "cancelled").length }
  ];

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-slate-100 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">MY HEALTH DASHBOARD</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Your appointments, payments & health records
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Upcoming Appointments",
            value: upcomingAppointments.length,
            icon: Calendar,
            color: "from-[#00A3E0] to-[#0082b3]",
            sub: "Scheduled visits"
          },
          {
            title: "Total Appointments",
            value: totalAppointments,
            icon: Stethoscope,
            color: "from-blue-500 to-blue-600",
            sub: "All-time visits"
          },
          {
            title: "Total Spent",
            value: `$${totalPayments.toFixed(2)}`,
            icon: DollarSign,
            color: "from-emerald-500 to-emerald-600",
            sub: `${paidAppointments} paid consultations`
          },
          {
            title: "Favorite Doctors",
            value: favoriteDoctors.length,
            icon: Heart,
            color: "from-rose-500 to-rose-600",
            sub: "Trusted practitioners"
          }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{card.value}</h3>
                </div>
                <div className={`bg-gradient-to-br ${card.color} text-white p-3 rounded-2xl`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-4 border-t border-slate-100 pt-3">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Appointment Status Chart + Favorite Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-6">Appointment Overview</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} fontSize={11} />
                <YAxis stroke="#94a3b8" tickLine={false} fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "11px", border: "none" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {appointmentStatusData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#00A3E0" : i === 1 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Favorite Doctors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-6">Your Favorite Doctors</h4>
          {favoriteDoctors.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="text-slate-200 mx-auto mb-3" size={32} />
              <p className="text-slate-400 text-sm font-bold">No appointments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteDoctors.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-800 text-sm">{doc.doctorName}</p>
                    <p className="text-xs text-slate-400">{doc.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-slate-600">{doc.avgRating} ({doc.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">{doc.appointmentCount}</p>
                    <p className="text-[10px] text-slate-400">visits</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Upcoming Appointments</h4>
            <p className="text-[11px] text-slate-400 font-medium">Your scheduled visits</p>
          </div>
          <a href="/dashboard/patient/my-appointments" className="text-xs font-bold text-[#00A3E0] hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </a>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="text-slate-200 mx-auto mb-3" size={32} />
            <p className="text-slate-400 text-sm font-bold">No upcoming appointments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black tracking-wider uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-4 pl-6">Doctor</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {upcomingAppointments.slice(0, 5).map((apt) => (
                  <tr key={apt._id?.toString()} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-800">{apt.doctorName}</td>
                    <td className="p-4 text-slate-500">General</td>
                    <td className="p-4 text-slate-700">{apt.appointmentDate} · {apt.appointmentTime}</td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                        apt.appointmentStatus === "confirmed" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {apt.appointmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}