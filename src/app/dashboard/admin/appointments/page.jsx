'use client';
import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000';

export default function AdminAppointmentsPage() {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

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

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const isCompleted = status === 'completed';
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${
        isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
      }`}>
        {isCompleted ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
        {status || "pending"}
      </span>
    );
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">Appointments Master Roster</h1>
        <p className="text-sm text-slate-500 mt-2">Manage and monitor all patient-doctor clinical consultations.</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-4 px-4 lg:py-5 lg:px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participants</th>
              <th className="py-4 px-4 lg:py-5 lg:px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</th>
              <th className="py-4 px-4 lg:py-5 lg:px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointmentsList.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-12 text-center text-slate-400 text-sm">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointmentsList.map((appt) => (
                <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 lg:py-6 lg:px-8">
                    <div className="flex flex-col gap-2">
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
                  <td className="py-4 px-4 lg:py-6 lg:px-8">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {appt.appointmentDate}</div>
                      <div className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> {appt.appointmentTime}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:py-6 lg:px-8 text-right">
                    {getStatusBadge(appt.appointmentStatus)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {appointmentsList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No appointments found
          </div>
        ) : (
          appointmentsList.map((appt) => (
            <div key={appt._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleRow(appt._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-xl">
                    <User size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{appt.patientName || "Unknown Patient"}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Stethoscope size={12} />
                      {appt.doctorName || "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(appt.appointmentStatus)}
                  {expandedRow === appt._id ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </div>
              
              {expandedRow === appt._id && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{appt.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      <span>{appt.appointmentTime}</span>
                    </div>
                  </div>
                  {appt.symptoms && (
                    <p className="mt-2 text-xs text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
                      Symptoms: {appt.symptoms}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {appointmentsList.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-6">
          Showing {appointmentsList.length} appointment{appointmentsList.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}