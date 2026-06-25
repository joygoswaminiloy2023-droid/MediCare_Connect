'use client';
import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000';

export default function AdminAppointmentsPage() {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/appointments`);
      const data = await response.json();
      setAppointmentsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch failure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Master Roster...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Appointments Master Roster</h1>
        <p className="text-slate-500 mt-2">Manage and monitor all patient-doctor clinical consultations.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participants</th>
              <th className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</th>
              <th className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointmentsList.map((appt) => (
              <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-6 px-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <div className="bg-indigo-50 p-1.5 rounded-lg"><User size={14} className="text-indigo-600" /></div>
                      {appt.patientName || "Unknown Patient"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="bg-slate-100 p-1.5 rounded-lg"><Stethoscope size={14} className="text-slate-600" /></div>
                      {appt.doctorName || "Unassigned"}
                    </div>
                  </div>
                </td>
                <td className="py-6 px-8">
                  <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {appt.appointmentDate}</div>
                    <div className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> {appt.appointmentTime}</div>
                  </div>
                </td>
                <td className="py-6 px-8 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase ${
                    appt.appointmentStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {appt.appointmentStatus === 'completed' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                    {appt.appointmentStatus || "pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}