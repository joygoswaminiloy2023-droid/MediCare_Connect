'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DollarSign } from 'lucide-react';

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
      setPaymentsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch failure context execution on tab payments:', error);
      toast.error('Failed to retrieve live logs for payments');
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
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Financial Clearing Matrix</h1>
        <p className="text-xs text-slate-500 font-medium">Verify payment gateways transactions tokens and captured volume parameters.</p>
      </div>
      {paymentsList.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">No processed gateway transaction entries recorded.</div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-4 px-6">Gateway Transaction Token</th>
                  <th className="py-4 px-6">Account Holder Reference</th>
                  <th className="py-4 px-6 text-right">Settled Gross Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {paymentsList.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] text-indigo-600 font-bold">{pay.transactionId || pay.txID || "TXN_MOCK_VAL"}</td>
                    <td className="py-4 px-6 text-slate-500">{pay.patientId || pay.userEmail || "System Guest"}</td>
                    <td className="py-4 px-6 font-black text-slate-900 text-right flex items-center justify-end gap-0.5"><DollarSign size={12}/>{pay.amount} BDT</td>
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