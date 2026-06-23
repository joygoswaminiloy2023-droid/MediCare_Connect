"use client";
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Star, TrendingUp, ArrowUpRight, Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const STATUS_STYLES = {
  pending:   "bg-amber-50 text-amber-600 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected:  "bg-red-50 text-red-500 border border-red-200",
};

export default function DoctorDashboardOverview() {
  const [stats, setStats]                   = useState(null);
  const [recentAppointments, setRecent]     = useState([]);
  const [loading, setLoading]               = useState(true);

  const { data: session } = authClient.useSession();
  const doctorEmail       = session?.user?.email;

  useEffect(() => {
    if (!doctorEmail) return;

    fetch(`${BACKEND}/api/doctors/dashboard-stats/${doctorEmail}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setRecent(data.recentAppointments || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [doctorEmail]);

  // ── Stat cards ─────────────────────────────────────────────────────────
  const statCards = stats ? [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon:  Calendar,
      color: "from-[#00A3E0] to-[#0082b3]",
      sub:   `${stats.todayAppointments} today`
    },
    {
      title: "Unique Patients",
      value: stats.totalPatients,
      icon:  Users,
      color: "from-blue-500 to-blue-600",
      sub:   "Distinct patient records"
    },
    {
      title: "Avg Rating",
      value: stats.avgRating || "—",
      icon:  Star,
      color: "from-amber-500 to-amber-600",
      sub:   `${stats.totalReviews} reviews received`
    },
    {
      title: "Pending Requests",
      value: stats.pendingAppointments,
      icon:  AlertCircle,
      color: "from-rose-500 to-rose-600",
      sub:   "Awaiting your approval"
    },
  ] : [];

  // ── Build weekly chart from recent appointments ─────────────────────────
  const weeklyData = (() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = Object.fromEntries(days.map(d => [d, 0]));
    recentAppointments.forEach(apt => {
      const day = new Date(apt.appointmentDate).toLocaleDateString("en-US", { weekday: "short" });
      if (counts[day] !== undefined) counts[day]++;
    });
    return days.map(d => ({ day: d, Appointments: counts[d] }));
  })();

  // ── Status summary for mini chart ──────────────────────────────────────
  const statusData = stats ? [
    { name: "Pending",   value: stats.pendingAppointments,   color: "#f59e0b" },
    { name: "Confirmed", value: stats.confirmedAppointments, color: "#3b82f6" },
    { name: "Completed", value: stats.completedAppointments, color: "#10b981" },
  ] : [];

  if (loading) return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="h-24 bg-slate-100 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-72 bg-slate-100 rounded-3xl" />
        <div className="h-72 bg-slate-100 rounded-3xl" />
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-8">

      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">WORKSPACE OVERVIEW</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Live clinical activity — real data from your appointments
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 self-start md:self-auto">
          <Activity size={16} className="text-[#00A3E0] animate-pulse" />
          <span className="text-xs font-bold text-slate-600">Practice Status: Active</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{card.title}</p>
                  <h3 className="text-4xl font-black text-slate-800 mt-2.5 tracking-tight">{card.value}</h3>
                </div>
                <div className={`bg-gradient-to-br ${card.color} text-white p-3.5 rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-5 border-t border-slate-100 pt-3 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-emerald-500" /> {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Weekly appointments bar chart */}
        <div className="w-full bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Weekly Appointments</h4>
              <p className="text-[11px] text-slate-400 font-medium">Based on your recent appointment data</p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">This Week</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} fontSize={11} />
                <YAxis stroke="#94a3b8" tickLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "11px", border: "none" }} />
                <Bar dataKey="Appointments" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "#00A3E0" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="w-full bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Appointment Status</h4>
              <p className="text-[11px] text-slate-400 font-medium">Breakdown of all appointment states</p>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg">All Time</span>
          </div>

          <div className="space-y-4 mt-2">
            {statusData.map(({ name, value, color }) => {
              const total = stats?.totalAppointments || 1;
              const pct   = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>{name}</span>
                    <span>{value} <span className="text-slate-400 font-medium">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today highlight */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#00A3E0]" />
              <span className="text-xs font-bold text-slate-600">Today's appointments</span>
            </div>
            <span className="text-xl font-black text-slate-900">{stats?.todayAppointments ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Recent appointments table */}
      <div className="w-full bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Recent Appointment Requests</h4>
            <p className="text-[11px] text-slate-400 font-medium">Latest 5 appointments from your patients</p>
          </div>
          <a href="/dashboard/doctor/appointments"
            className="text-xs font-bold text-[#00A3E0] hover:underline flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </a>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="text-slate-200 mx-auto mb-3" size={32} />
            <p className="text-slate-400 text-sm font-bold">No appointments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black tracking-wider uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-4 pl-6">Patient</th>
                  <th className="p-4">Symptoms</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {recentAppointments.map((apt) => (
                  <tr key={apt._id?.toString()} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-800">
                      {apt.patientName || "Patient"}
                    </td>
                    <td className="p-4 font-medium text-slate-400 max-w-[180px] truncate">
                      {apt.symptoms}
                    </td>
                    <td className="p-4 text-slate-700">
                      {apt.appointmentDate} · {apt.appointmentTime}
                    </td>
                    <td className="p-4">
                      {apt.paymentStatus === "paid"
                        ? <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle size={11} /> Paid</span>
                        : <span className="flex items-center gap-1 text-red-500 font-bold"><XCircle size={11} /> Unpaid</span>
                      }
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase ${STATUS_STYLES[apt.appointmentStatus] || STATUS_STYLES.pending}`}>
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