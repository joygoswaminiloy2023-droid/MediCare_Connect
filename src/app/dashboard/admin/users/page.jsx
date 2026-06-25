'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Ban, RotateCcw, Stethoscope, User as UserIcon,
  ShieldCheck, Users, CalendarCheck, LogIn
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000';
const RESTRICT_OPTIONS = [1, 3, 7, 14, 30];

function formatDateTime(value) {
  if (!value) return 'Never logged in';
  const d = new Date(value);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function RoleBadge({ role }) {
  const map = {
    doctor: { label: 'Doctor', icon: Stethoscope, classes: 'bg-teal-50 text-teal-600' },
    patient: { label: 'Patient', icon: UserIcon, classes: 'bg-sky-50 text-sky-600' },
  };
  const conf = map[role] || map.patient;
  const Icon = conf.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${conf.classes}`}>
      <Icon size={12} /> {conf.label}
    </span>
  );
}

function StatusBadge({ status, restrictedUntil }) {
  if (status === 'banned') return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-600 border border-rose-100">Banned</span>;
  if (status === 'restricted') return (
    <div className="flex flex-col">
      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100 w-fit">Restricted</span>
      {restrictedUntil && <span className="text-[9px] text-slate-400 mt-1">Until {new Date(restrictedUntil).toLocaleDateString()}</span>}
    </div>
  );
  return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>;
}

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`);
      const data = await response.json();
      // ✅ FILTER OUT ADMINS - ONLY SHOW PATIENTS & DOCTORS
      const filtered = Array.isArray(data) 
        ? data.filter(user => user.role !== 'admin')
        : [];
      setUsersList(filtered);
    } catch { toast.error('Failed to load users'); }
    finally { setIsLoading(false); }
  };

  const performAction = async (action, userId, data = {}) => {
    setOpenMenuId(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${action}/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if ((await response.json()).success) {
        toast.success(`User updated successfully`);
        fetchUsers();
      }
    } catch { toast.error('Action failed'); }
  };

  const renderActions = (user) => {
    if (user.status !== 'active') return (
      <button onClick={() => performAction('restore', user._id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-[11px] font-bold flex items-center gap-2">
        <RotateCcw size={13} /> Undo
      </button>
    );

    return (
      <div className="flex items-center gap-2 relative">
        <button onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-all">
          <Clock size={16} />
        </button>
        <AnimatePresence>
          {openMenuId === user._id && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-10 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 w-32">
              {RESTRICT_OPTIONS.map(days => (
                <button key={days} onClick={() => performAction('restrict', user._id, { days })} className="block w-full text-left px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
                  {days} Day{days > 1 ? 's' : ''}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => performAction('ban', user._id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all">
          <Ban size={16} />
        </button>
      </div>
    );
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Manage System Users</h1>
        <p className="text-slate-500 text-sm mt-1">{usersList.length} patient{usersList.length !== 1 ? 's' : ''} & doctor{usersList.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-visible">
        {usersList.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 font-bold">
            No patients or doctors found
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-50">
                  <th className="py-6 px-8">User Profile</th>
                  <th className="py-6 px-4">Role</th>
                  <th className="py-6 px-4">Last Login</th>
                  <th className="py-6 px-4">Status</th>
                  <th className="py-6 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usersList.map((user) => (
                  <motion.tr key={user._id} whileHover={{ backgroundColor: "#fafafa" }} className="text-sm">
                    <td className="py-5 px-8 flex items-center gap-4">
                      <img src={user.image || "https://ui-avatars.com/api/?name=" + user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={user.name} />
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4"><RoleBadge role={user.role} /></td>
                    <td className="py-5 px-4 text-slate-500 font-mono text-[11px]">{formatDateTime(user.lastLogin)}</td>
                    <td className="py-5 px-4"><StatusBadge status={user.status} restrictedUntil={user.restrictedUntil} /></td>
                    <td className="py-5 px-8 text-right overflow-visible">{renderActions(user)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}