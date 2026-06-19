"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ClipboardCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AppointmentRequestsSuite() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([
    { id: "apt-101", patientName: "Alexander Wright", symptoms: "Chronic lower lumbar discomfort and stiffness", date: "2026-06-25", time: "10:30 AM", status: "Pending" },
    { id: "apt-102", patientName: "Evelyn Sterling", symptoms: "Recurring migraine headaches triggered by bright light", date: "2026-06-26", time: "02:00 PM", status: "Confirmed" }
  ]);

  const updateStatus = (id, targetStatus) => {
    setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: targetStatus } : apt));
    toast.success(`Appointment records tracking entry set to: ${targetStatus}`);

    // Assignment constraint implementation check: Route immediately on complete status change matching criteria
    if (targetStatus === 'Completed') {
      setTimeout(() => {
        router.push(`/dashboard/doctor/prescriptions?appointmentId=${id}`);
      }, 1000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">APPOINTMENT REQUEST LOG</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluate clinical booking metrics, approve windows, or log consultations</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black tracking-wider uppercase border-b border-slate-800">
                <th className="p-4 pl-6">Patient Reference</th>
                <th className="p-4">Reported Symptoms</th>
                <th className="p-4">Schedule Window</th>
                <th className="p-4">Status Flag</th>
                <th className="p-4 pr-6 text-right">Operations Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800">{apt.patientName}</td>
                  <td className="p-4 max-w-xs truncate font-medium text-slate-400">{apt.symptoms}</td>
                  <td className="p-4 text-slate-700">{apt.date} at {apt.time}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase ${
                      apt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      apt.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                    {apt.status === 'Pending' && (
                      <>
                        <button onClick={() => updateStatus(apt.id, 'Confirmed')} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white p-2 rounded-xl transition-all" title="Accept Request">
                          <Check size={14} />
                        </button>
                        <button onClick={() => updateStatus(apt.id, 'Rejected')} className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-2 rounded-xl transition-all" title="Reject Request">
                          <X size={14} />
                        </button>
                      </>
                    )}
                    {apt.status === 'Confirmed' && (
                      <button onClick={() => updateStatus(apt.id, 'Completed')} className="bg-[#00A3E0]/10 text-[#00A3E0] hover:bg-[#00A3E0] hover:text-white px-3 py-1.5 rounded-xl font-black text-[10px] tracking-wide transition-all flex items-center gap-1.5 ml-auto" title="Mark Completed and Generate Script">
                        <ClipboardCheck size={12} /> COMPLETE & PRESCRIBE
                      </button>
                    )}
                    {apt.status === 'Completed' && (
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black pr-2 block">Archived Log</span>
                    )}
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