'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

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
      if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
      const data = await response.json();
      setAppointmentsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch failure context execution on tab appointments:', error);
      toast.error('Failed to retrieve live logs for appointments');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#00A3E0] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Matrix Core Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Appointments Master Roster</h1>
        <p className="text-xs text-slate-500 font-medium">Global systemic catalog of arranged patient consultations.</p>
      </div>
      {appointmentsList.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">No structured booking documents filed.</div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-4 px-6">Patient Core ID</th>
                  <th className="py-4 px-6">Doctor Referent ID</th>
                  <th className="py-4 px-6">Target Date</th>
                  <th className="py-4 px-6">Allocated Slot</th>
                  <th className="py-4 px-6 text-right">Flow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {appointmentsList.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{appt.patientId || appt.userId || "Not Specified"}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">{appt.doctorId}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{appt.appointmentDate || appt.date}</td>
                    <td className="py-4 px-6 text-slate-500">{appt.appointmentTime || appt.time}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${appt.appointmentStatus === 'completed' || appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {appt.appointmentStatus || appt.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}