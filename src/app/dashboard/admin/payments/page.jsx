'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DollarSign, User, Stethoscope, ShieldCheck, Loader2, ChevronDown, ChevronUp, Calendar, Clock, CreditCard } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000';

export default function AdminPaymentsPage() {
  const [paymentsList, setPaymentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/payments`);
      if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
      const data = await response.json();
      setPaymentsList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to retrieve secure transaction logs');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Financial Clearing Matrix</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time audit of patient-doctor payment settlement protocols.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex-shrink-0">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Secure Ledger Active</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest">
              <th className="py-4 px-4 lg:py-5 lg:px-6">Transaction Token</th>
              <th className="py-4 px-4 lg:py-5 lg:px-6">Patient Name</th>
              <th className="py-4 px-4 lg:py-5 lg:px-6">Attending Doctor</th>
              <th className="py-4 px-4 lg:py-5 lg:px-6">Date</th>
              <th className="py-4 px-4 lg:py-5 lg:px-6 text-right">Settled Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paymentsList.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                  No payments found
                </td>
              </tr>
            ) : (
              paymentsList.map((pay) => (
                <tr key={pay._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 lg:py-5 lg:px-6">
                    <span className="font-mono text-[10px] sm:text-[11px] font-bold text-indigo-600 tracking-tight break-all">
                      {pay.transactionId || pay.txID || "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4 lg:py-5 lg:px-6">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                      <User size={14} className="text-slate-400 flex-shrink-0" />
                      {pay.patientName || pay.patientId?.name || "Anonymous Patient"}
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:py-5 lg:px-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Stethoscope size={14} className="text-slate-400 flex-shrink-0" />
                      {pay.doctorName || pay.doctorId?.name || "Unassigned"}
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:py-5 lg:px-6 text-sm text-slate-500">
                    {formatDate(pay.paymentDate || pay.createdAt)}
                  </td>
                  <td className="py-4 px-4 lg:py-5 lg:px-6 text-right">
                    <span className="inline-flex items-center gap-0.5 px-3 py-1 font-black text-slate-900 bg-slate-50 rounded-xl">
                      <DollarSign size={12} />
                      {pay.amount?.toLocaleString()} BDT
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paymentsList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No payments found
          </div>
        ) : (
          paymentsList.map((pay) => (
            <div key={pay._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleRow(pay._id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-emerald-50 p-2 rounded-xl flex-shrink-0">
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">
                      {pay.patientName || "Anonymous Patient"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {pay.doctorName || "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-black text-sm text-slate-900">
                    {pay.amount?.toLocaleString()} BDT
                  </span>
                  {expandedRow === pay._id ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </div>
              
              {expandedRow === pay._id && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CreditCard size={16} className="text-slate-400" />
                      <span className="font-mono text-xs break-all">
                        {pay.transactionId || pay.txID || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{formatDate(pay.paymentDate || pay.createdAt)}</span>
                    </div>
                    {pay.paymentStatus && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          pay.paymentStatus === 'paid' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {pay.paymentStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {paymentsList.length > 0 && (
        <p className="text-center text-xs text-slate-400">
          Showing {paymentsList.length} transaction{paymentsList.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}