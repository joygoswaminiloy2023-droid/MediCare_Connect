"use client";
import React, { useState } from 'react';
import { Plus, Trash2, CalendarRange, Clock, CalendarDays, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ManageScheduleWorkspace() {
  const [schedule, setSchedule] = useState([
    { id: "1", day: "Monday", timeSlot: "09:00 AM - 10:30 AM" },
    { id: "2", day: "Wednesday", timeSlot: "02:00 PM - 03:30 PM" },
    { id: "3", day: "Friday", timeSlot: "10:00 AM - 12:00 PM" }
  ]);
  const [newDay, setNewDay] = useState("Monday");
  const [newTime, setNewTime] = useState("");

  // Static Calendar Mock Generation Metadata for June 2026
  const weekdaysLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const startOffsetBlankDays = Array.from({ length: 1 }); // June 2026 starts on a Monday

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!newTime) return toast.warning("Provide a time slot parameter boundary.");
    const payload = { id: Date.now().toString(), day: newDay, timeSlot: newTime };
    setSchedule([...schedule, payload]);
    setNewTime("");
    toast.success("Schedule allocation slot logged successfully.");
  };

  const handleRemoveSchedule = (id) => {
    setSchedule(schedule.filter(item => item.id !== id));
    toast.info("Schedule tracking block dropped cleanly.");
  };

  // Helper function to check if a specific calendar cell maps to a chosen active workday string
  const checkActiveDayHighlight = (dayNum) => {
    // Basic structural day-mapping for mock visual presentation layout tracking
    const dayMap = { 1: "Monday", 3: "Wednesday", 5: "Friday", 8: "Monday", 10: "Wednesday", 12: "Friday", 15: "Monday", 17: "Wednesday", 19: "Friday", 22: "Monday", 24: "Wednesday", 26: "Friday", 29: "Monday" };
    return schedule.some(item => item.day === dayMap[dayNum]);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER BLOCK */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">MANAGE PRACTICE SCHEDULE</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Configure, allocate, or suspend operational consultation windows</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50/50 text-blue-600 px-4 py-2.5 rounded-2xl border border-blue-100 font-bold text-xs">
          <CalendarDays size={16} /> June 2026 Ledger
        </div>
      </div>

      {/* CORE INTERACTION SPACE GRID */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CONTROL PANEL FORM */}
        <div className="space-y-6 flex flex-col h-fit">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
              <CalendarRange size={14} className="text-[#00A3E0]" /> Create Allocation Block
            </h3>
            
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Target Week Day</label>
                <select 
                  value={newDay} 
                  onChange={(e) => setNewDay(e.target.value)} 
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] transition-colors appearance-none cursor-pointer"
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Time Block Constraints</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Clock size={14} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="e.g., 09:00 AM - 11:00 AM" 
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0] transition-colors placeholder:text-slate-400" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#00A3E0] hover:bg-[#0082b3] text-white font-black py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#00A3E0]/10 hover:shadow-lg mt-2">
                <Plus size={14} strokeWidth={3} /> COMMIT TO TIMELINE
              </button>
            </form>
          </div>

          {/* QUICK PROMPT INFO INSIGHT */}
          <div className="bg-slate-900 text-slate-400 p-5 rounded-3xl flex items-start gap-3">
            <AlertCircle size={16} className="text-[#00A3E0] shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium leading-relaxed">
              Allocated slots will auto-populate onto active public booking schedules for verified platform user entities.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE MONTHLY VIEW CALENDAR */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays size={14} className="text-[#00A3E0]" /> Interactive Grid Overview
              </h3>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">Visual month index mapping active days</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button type="button" className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"><ChevronLeft size={14} /></button>
              <span className="text-[10px] font-black uppercase px-1 text-slate-700">June 2026</span>
              <button type="button" className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"><ChevronRight size={14} /></button>
            </div>
          </div>

          {/* CALENDAR VIEW GRID CANVAS */}
          <div className="w-full grid grid-cols-7 gap-1 text-center border-t border-slate-100 pt-4">
            {weekdaysLabel.map((day) => (
              <div key={day} className="text-[10px] font-black tracking-wider text-slate-400 uppercase py-1.5">{day}</div>
            ))}
            
            {startOffsetBlankDays.map((_, idx) => (
              <div key={`blank-${idx}`} className="p-2 bg-slate-50/30 rounded-xl" />
            ))}

            {daysInMonth.map((dayNum) => {
              const isSlotActive = checkActiveDayHighlight(dayNum);
              return (
                <div 
                  key={dayNum} 
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-default group ${
                    isSlotActive 
                      ? 'bg-blue-50 text-[#00A3E0] font-black border border-blue-100 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isSlotActive && (
                    <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#00A3E0] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* CALENDAR METADATA FOOTER */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-blue-50 border border-blue-100" /> Active Roster Day
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-slate-50" /> Off-duty
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE HOURS REGISTRY LIST */}
        <div className="space-y-3 flex flex-col">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Active Hours Registry</h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Live roster blocks sequence logs</p>
          </div>

          {schedule.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 bg-white rounded-3xl text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-2">
              <Clock size={20} className="text-slate-300 animate-spin" />
              <span>No active operational schedule found.</span>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[400px] pr-1">
              {schedule.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-2.5 rounded-xl font-black text-[10px] tracking-wider uppercase w-20 text-center shadow-sm">
                      {item.day.substring(0, 3)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.day}</span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mt-0.5">
                        <Clock size={12} className="text-[#00A3E0]" /> {item.timeSlot}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveSchedule(item.id)} 
                    className="text-slate-400 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-50 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Drop Allocation Block"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}