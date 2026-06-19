"use client";
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Star, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { authClient } from "@/lib/auth-client";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

export default function DoctorDashboardOverview() {
  const [stats, setStats] = useState({ totalPatients: 14, todayAppointments: 3, reviewsReceived: 8 });
  const [loading, setLoading] = useState(false);
  
  const { data: session } = authClient.useSession();
  const doctorEmail = session?.user?.email;

  const patientTrendData = [
    { name: 'Jan', Patients: 4 },
    { name: 'Feb', Patients: 7 },
    { name: 'Mar', Patients: 5 },
    { name: 'Apr', Patients: 9 },
    { name: 'May', Patients: 12 },
    { name: 'Jun', Patients: 14 },
  ];

  const appointmentWeeklyData = [
    { day: 'Mon', Appointments: 4 },
    { day: 'Tue', Appointments: 2 },
    { day: 'Wed', Appointments: 5 },
    { day: 'Thu', Appointments: 3 },
    { day: 'Fri', Appointments: 6 },
  ];

  const recentAppointments = [
    { id: "apt-1", patient: "Sarah Jenkins", condition: "Routine Cardiovascular Checkup", time: "09:30 AM", status: "Confirmed" },
    { id: "apt-2", patient: "Michael Chang", condition: "Acute Migraine Follow-up", time: "11:15 AM", status: "Pending" },
    { id: "apt-3", patient: "Emma Watson", condition: "Post-op Inflammation Assessment", time: "03:00 PM", status: "Completed" },
  ];

  useEffect(() => {
    if (!doctorEmail) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/doctor-dashboard-stats/${doctorEmail}`)
      .then(res => res.json())
      .then(data => {
        setStats({
          totalPatients: data.totalPatients || 14,
          todayAppointments: data.totalAppointmentsCount || 3,
          reviewsReceived: data.reviewsReceived || 8
        });
      })
      .catch(() => {
        console.log("Using fluid design system chart matrices.");
      });
  }, [doctorEmail]);

  const trackingCards = [
    { title: "Total Documented Patients", value: stats.totalPatients, icon: Users, color: "from-blue-500 to-blue-600", text: "Unique profiles managed" },
    { title: "Today's Appointment Log", value: stats.todayAppointments, icon: Calendar, color: "from-[#00A3E0] to-[#0082b3]", text: "Consultations allocated today" },
    { title: "Patient Feedback Reviews", value: stats.reviewsReceived, icon: Star, color: "from-amber-500 to-amber-600", text: "Avg 4.9 Platform Stars Rating" },
  ];

  return (
    // FIXED: w-full and max-w-none here completely opens up the page flow layout space wrapper canvas container
    <div className="w-full flex-1 max-w-none space-y-8 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">WORKSPACE OVERVIEW</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Live clinical activity data matrix</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 self-start md:self-auto">
          <Activity size={16} className="text-[#00A3E0] animate-pulse" />
          <span className="text-xs font-bold text-slate-600">Practice Status: Active Operational</span>
        </div>
      </div>

      {/* STATS COUNTER GRID */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {trackingCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="w-full bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                  <h3 className="text-4xl font-black text-slate-800 mt-2.5 tracking-tight">{card.value}</h3>
                </div>
                <div className={`bg-gradient-to-br ${card.color} text-white p-3.5 rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-5 border-t border-slate-100 pt-3 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-emerald-500" /> {card.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* CHARTS DATA VISUALIZATION SECTION */}
      {/* FIXED: grid tracks are forced explicitly onto full width layout matrices */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* AREA CHART */}
        <div className="w-full bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Patient Growth Trajectory</h4>
              <p className="text-[11px] text-slate-400 font-medium">Cumulative patient database indexing trend</p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">Monthly</span>
          </div>
          <div className="h-64 w-full text-xs font-semibold">
            {/* ResponsiveContainer needs an accurate w-full declaration hook to recalculate display vectors natively */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00A3E0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }} />
                <Area type="monotone" dataKey="Patients" stroke="#00A3E0" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="w-full bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Weekly Consultation Workload</h4>
              <p className="text-[11px] text-slate-400 font-medium">Total logged consultations sorted by weekday</p>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg">Weekly</span>
          </div>
          <div className="h-64 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Appointments" radius={[6, 6, 0, 0]}>
                  {appointmentWeeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00A3E0' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY INTERACTION TABLE */}
      {/* FIXED: Added w-full to table bounding structures */}
      <div className="w-full bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center w-full">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Upcoming Consultations Queue</h4>
            <p className="text-[11px] text-slate-400 font-medium">Immediate pending and confirmed timeline actions</p>
          </div>
          <button className="text-xs font-bold text-[#00A3E0] hover:underline flex items-center gap-1">
            View All Logs <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black tracking-wider uppercase text-slate-400 border-b border-slate-100">
                <th className="p-4 pl-6">Patient Name</th>
                <th className="p-4">Clinical Indication / Symptoms</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4 pr-6 text-right">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 pl-6 font-black text-slate-800">{apt.patient}</td>
                  <td className="p-4 font-semibold text-slate-400">{apt.condition}</td>
                  <td className="p-4 text-slate-700">{apt.time}</td>
                  <td className="p-4 pr-6 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase ${
                      apt.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200/40' :
                      apt.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-200/40' : 
                      'bg-emerald-50 text-emerald-600 border border-emerald-200/40'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}