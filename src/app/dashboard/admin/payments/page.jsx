'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DollarSign, User, Stethoscope, ShieldCheck, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export default function AdminPaymentsPage() {
  const [paymentsList, setPaymentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/payments`);
      if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
      const data = await response.json();
      // Debugging: View the data structure in your Browser Console (F12)
      console.log('API Response Data:', data);
      setPaymentsList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to retrieve secure transaction logs');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Ledger...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Clearing Matrix</h1>
          <p className="text-sm text-slate-500">Real-time audit of patient-doctor payment settlement protocols.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Secure Ledger Active</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest">
              <th className="py-5 px-6">Transaction Token</th>
              <th className="py-5 px-6">Patient Name</th>
              <th className="py-5 px-6">Attending Doctor</th>
              <th className="py-5 px-6 text-right">Settled Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paymentsList.map((pay) => (
              <tr key={pay._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-5 px-6 font-mono text-[11px] font-bold text-indigo-600 tracking-tight">
                  {pay.transactionId || pay.txID || "N/A"}
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                    <User size={14} className="text-slate-400" />
                    {/* Checking for name property in nested object or direct property */}
                    {pay.patientName || pay.patientId?.name || "Anonymous Patient"}
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Stethoscope size={14} className="text-slate-400" />
                    {/* Checking for name property in nested object or direct property */}
                    {pay.doctorName || pay.doctorId?.name || "Unassigned"}
                  </div>
                </td>
                <td className="py-5 px-6 text-right font-black text-slate-900">
                  <div className="inline-flex items-center justify-end gap-0.5 px-3 py-1">
                    <DollarSign size={12} />
                    {pay.amount?.toLocaleString()} BDT
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}