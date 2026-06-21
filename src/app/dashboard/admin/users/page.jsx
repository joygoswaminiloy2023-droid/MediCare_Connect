'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserX, UserCheck } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`);
      if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
      const data = await response.json();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch failure context execution on tab users:', error);
      toast.error('Failed to retrieve live logs for users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSuspension = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/suspend/${userId}`, { method: 'PATCH' });
      const result = await response.json();
      if (result.success) {
        toast.success(`Account state changed to ${result.nextStatus}`);
        fetchUsers();
      }
    } catch (err) { toast.error('Error modifying targeted user lifecycle status'); }
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
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Manage System Users</h1>
        <p className="text-xs text-slate-500 font-medium">Monitor or restrict patient profiles across the system.</p>
      </div>
      {usersList.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-xs font-bold text-slate-400 uppercase">No system users found.</div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {usersList.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} className="w-8 h-8 rounded-full object-cover border" alt="" />
                      <span className="font-bold text-slate-900">{user.name || "Anonymous Patient"}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-500">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.status === 'suspended' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {user.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => toggleUserSuspension(user._id)} className="p-2 bg-slate-50 hover:bg-slate-100 border rounded-xl text-slate-700 transition-all">
                        {user.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>
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