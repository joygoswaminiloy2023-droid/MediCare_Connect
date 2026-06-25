"use client";
import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Stethoscope, CheckCircle, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const BACKEND = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export default function PatientPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = authClient.useSession();
  const patientEmail = session?.user?.email;

  useEffect(() => {
    if (!patientEmail) return;

    fetch(`${BACKEND}/api/patients/payments/${patientEmail}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setPayments(data.payments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientEmail]);

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidCount = payments.filter(p => p.paymentStatus === "paid").length;
  const unpaidCount = payments.filter(p => p.paymentStatus === "unpaid").length;

  // Monthly breakdown
  const monthlyData = (() => {
    const months = {};
    payments.forEach(p => {
      if (p.paymentDate) {
        const month = new Date(p.paymentDate).toLocaleString('default', { month: 'short' });
        months[month] = (months[month] || 0) + (p.amount || 0);
      }
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount: Number(amount.toFixed(2)) }));
  })();

  const statusData = [
    { name: "Paid", value: paidCount, color: "#10b981" },
    { name: "Unpaid", value: unpaidCount, color: "#ef4444" }
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#00A3E0] mx-auto mb-3" size={28} />
        <p className="text-slate-400 text-xs font-bold uppercase">Loading payment history...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Payment History</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          Transaction records and payment details
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            title: "Total Spent",
            value: `$${totalAmount.toFixed(2)}`,
            icon: DollarSign,
            color: "from-emerald-500 to-emerald-600",
            sub: "All payments"
          },
          {
            title: "Paid",
            value: paidCount,
            icon: CheckCircle,
            color: "from-blue-500 to-blue-600",
            sub: "Completed transactions"
          },
          {
            title: "Unpaid",
            value: unpaidCount,
            icon: AlertCircle,
            color: "from-red-500 to-red-600",
            sub: "Pending payments"
          }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly spending chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-6">Monthly Spending</h4>
          {monthlyData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400">
              <p className="text-sm">No payment data yet</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} fontSize={11} />
                  <YAxis stroke="#94a3b8" tickLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "11px", border: "none" }} />
                  <Bar dataKey="amount" fill="#00A3E0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-6">Payment Status</h4>
          {payments.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400">
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Transaction Records</h4>
          <p className="text-[11px] text-slate-400 font-medium">All payment transactions</p>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="text-slate-200 mx-auto mb-3" size={32} />
            <p className="text-slate-400 text-sm font-bold">No payment history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black tracking-wider uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-4 pl-6">Doctor</th>
                  <th className="p-4">Appointment Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {payments.map((payment) => (
                  <tr key={payment._id?.toString()} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-800">{payment.doctorName || "Unknown"}</td>
                    <td className="p-4 text-slate-700">
                      {payment.appointmentDate} · {payment.appointmentTime}
                    </td>
                    <td className="p-4 font-black text-slate-800">${payment.amount?.toFixed(2) || "0.00"}</td>
                    <td className="p-4 text-[9px] font-mono text-slate-500 truncate max-w-xs">
                      {payment.transactionId || "—"}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase ${
                        payment.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      }`}>
                        {payment.paymentStatus}
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