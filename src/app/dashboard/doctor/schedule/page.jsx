"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Loader2, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { toast } from 'react-toastify';
import { FaCross } from 'react-icons/fa';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // The doctor's REAL public availableSlots, as currently shown on the
  // find-doctors listing & booking page. This is recomputed server-side
  // from active DoctorSchedule entries every time one is added, toggled,
  // or deleted below — so this panel always reflects what patients see.
  const [liveSlots, setLiveSlots] = useState(null);

  const [form, setForm] = useState({
    dayOfWeek: "Monday",
    startTime: "09:00 AM",
    endTime: "10:00 AM"
  });

  const { data: session } = authClient.useSession();
  const doctorEmail = session?.user?.email;

  // Fetch schedules
  const fetchSchedules = async () => {
    if (!doctorEmail) return;
    try {
      const res = await fetch(`${BACKEND}/api/doctors/schedule/${doctorEmail}`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    }
  };

  // Fetch the doctor's current public profile so the "Live on your
  // profile" panel has something to show before the first edit is made.
  const fetchLiveSlots = async () => {
    if (!doctorEmail) return;
    try {
      const res = await fetch(`${BACKEND}/api/doctors/profile/${doctorEmail}`);
      const data = await res.json();
      if (data.success) {
        setLiveSlots(data.profile?.availableSlots || []);
      }
    } catch (err) {
      console.error("Failed to fetch live slots:", err);
    }
  };

  useEffect(() => {
    if (!doctorEmail) return;
    fetchSchedules();
    fetchLiveSlots();
    setLoading(false);
  }, [doctorEmail]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${BACKEND}/api/doctors/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorEmail,
          ...form
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Time slot added!");
        setForm({ dayOfWeek: "Monday", startTime: "09:00 AM", endTime: "10:00 AM" });
        if (data.availableSlots) setLiveSlots(data.availableSlots);
        // Refetch immediately
        await fetchSchedules();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to add schedule");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm("Delete this schedule?")) return;

    try {
      const res = await fetch(`${BACKEND}/api/doctors/schedule/${scheduleId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Schedule deleted!");
        if (data.availableSlots) setLiveSlots(data.availableSlots);
        await fetchSchedules();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to delete schedule");
      console.error(err);
    }
  };

  const handleToggleActive = async (schedule) => {
    try {
      const res = await fetch(`${BACKEND}/api/doctors/schedule/${schedule._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !schedule.isActive })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(schedule.isActive ? "Disabled " : "Enabled ");
        if (data.availableSlots) setLiveSlots(data.availableSlots);
        await fetchSchedules();
      }
    } catch (err) {
      toast.error("Failed to update schedule");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-100 rounded-3xl" />
          <div className="h-96 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">Manage Practice Schedule</h1>
        <p className="text-sm text-slate-500 mt-2">Configure your operational consultation windows</p>
      </div>

      {/* Live-on-profile panel — proves the schedule below is actually
          driving what patients see, instead of a static signup-time value */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
          <Globe size={16} className="text-[#00A3E0]" />
          Live on Your Public Profile
        </h2>
        {liveSlots === null ? (
          <p className="text-xs text-slate-400">Loading...</p>
        ) : liveSlots.length === 0 ? (
          <p className="text-xs text-slate-400">
            No active time slots yet — patients won't see any bookable hours until you add one below.
          </p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {liveSlots.map((slot, i) => (
              <span key={i} className="bg-blue-50 text-[#00A3E0] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-blue-100">
                {slot}
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-3">
          This updates automatically whenever you add, enable/disable, or delete a slot below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Add Schedule Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Plus size={20} className="text-[#00A3E0]" />
            Add Time Slot
          </h2>

          <form onSubmit={handleAddSchedule} className="space-y-5">
            {/* Day */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Select Day</label>
              <select
                value={form.dayOfWeek}
                onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:border-[#00A3E0] focus:outline-none"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Start Time</label>
              <select
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:border-[#00A3E0] focus:outline-none"
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* End Time */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase block mb-2">End Time</label>
              <select
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:border-[#00A3E0] focus:outline-none"
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00A3E0] hover:bg-[#0082b3] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Adding...</>
              ) : (
                <><Plus size={16} /> Add Time Slot</>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-xs text-blue-800 font-semibold flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>Active time slots will appear on patient booking page</span>
            </p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-[#00A3E0]" />
            Active Hours Registry
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {DAYS.map(day => {
              const daySchedules = schedules.filter(s => s.dayOfWeek === day && s.isActive);
              return (
                <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-600 uppercase mb-2">{day}</p>
                      {daySchedules.length > 0 ? (
                        <div className="space-y-2">
                          {daySchedules.map((sch, i) => (
                            <div key={i} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-[10px] font-bold">
                              <CheckCircle size={10} />
                              {sch.startTime} - {sch.endTime}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No active slots</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* All Schedules Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-black text-slate-900"> All Schedules</h2>
          <p className="text-xs text-slate-500 mt-1">{schedules.length} time slot{schedules.length !== 1 ? 's' : ''} configured</p>
        </div>

        {schedules.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="text-slate-300 mx-auto mb-3" size={40} />
            <p className="text-slate-400 font-bold">No schedules yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-black text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">Day</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map(schedule => (
                  <tr key={schedule._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{schedule.dayOfWeek}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${
                        schedule.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {schedule.isActive ? (
                          <><CheckCircle size={10} /> Active</>
                        ) : (
                          <><FaCross></FaCross> Inactive</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(schedule)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          schedule.isActive
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {schedule.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule._id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
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