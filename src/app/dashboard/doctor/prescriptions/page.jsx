"use client";
import React, { useState } from 'react';
import { FilePlus, Edit, Eye, ShieldAlert, Pill, FileText, User, Activity, FileCheck, X, Printer } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PrescriptionManagementDashboard() {
  const [prescriptions, setPrescriptions] = useState([
    { 
      id: "rx-9021", 
      patientName: "Alexander Wright", 
      diagnosis: "Lumbar Strain / Muscle Stiffness", 
      medications: "Ibuprofen 400mg x2 Daily, Baclofen 10mg", 
      notes: "Complete bed rest for 48 hours; apply heat packs.",
      date: "2026-06-19"
    }
  ]);
  const [form, setForm] = useState({ patientName: "", diagnosis: "", medications: "", notes: "" });
  const [editingId, setEditingId] = useState(null);
  const [activePreview, setActivePreview] = useState(null);

  const handleSubmitScript = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.diagnosis) return toast.warning("Missing data payload fields mapping targets.");

    if (editingId) {
      setPrescriptions(prescriptions.map(p => p.id === editingId ? { ...p, ...form } : p));
      toast.success("Prescription record metrics revised smoothly.");
      setEditingId(null);
    } else {
      const newScript = {
        id: `rx-${Date.now().toString().slice(-4)}`,
        ...form,
        date: new Date().toISOString().split('T')[0]
      };
      setPrescriptions([newScript, ...prescriptions]);
      toast.success("New medical script published safely.");
    }
    setForm({ patientName: "", diagnosis: "", medications: "", notes: "" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm({ patientName: "", diagnosis: "", medications: "", notes: "" });
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">PRESCRIPTION CLINICAL ENGINE</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Generate diagnostic summaries, track patient histories, and authorize scripts</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50/60 text-emerald-600 border border-emerald-100 px-4 py-2.5 rounded-2xl text-xs font-bold">
          <FileCheck size={15} /> Encryption Protocol Active
        </div>
      </div>

      {/* CORE CONTENT LAYOUT GRID */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PRESCRIPTION GENERATOR FORM */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FilePlus size={14} className="text-[#00A3E0]" /> 
              {editingId ? "Revise Prescription" : "Publish Clinical Script"}
            </h3>
            {editingId && (
              <button onClick={cancelEditing} className="text-[10px] font-bold text-rose-500 hover:underline">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitScript} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Patient Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><User size={13} /></span>
                <input type="text" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] text-slate-700" placeholder="Full Legal Name" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Diagnosis Summary</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Activity size={13} /></span>
                <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] text-slate-700" placeholder="e.g. Acute Gastritis" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Medication Directives</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400"><Pill size={13} /></span>
                <textarea value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0] h-24 resize-none text-slate-600 placeholder:text-slate-400/80" placeholder="Drug Name, Dosage Strength, Daily Frequency Parameters" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Clinical Advisory Notes</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400"><FileText size={13} /></span>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0] h-20 resize-none text-slate-600" placeholder="Additional physiological restrictions or lifestyle metrics" />
              </div>
            </div>

            <button type="submit" className={`w-full text-white font-black py-3 rounded-xl text-xs transition-all tracking-wider uppercase shadow-md ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'}`}>
              {editingId ? "Apply Corrections" : "Authorize & Sign Script"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: HISTORICAL SCRIPT LOG ENTRIES */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Historical Issued Records Log</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">Audit stream of signed electronic directives</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-bold">{prescriptions.length} Records</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[620px] pr-1">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative group hover:border-[#00A3E0]/40 transition-all duration-200">
                
                {/* CARD INNER TOP ENTRY PANEL */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start">
                    <div className="bg-blue-50 text-[#00A3E0] p-2.5 rounded-xl mt-0.5">
                      <Pill size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-md tracking-wider uppercase">{rx.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{rx.date}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-base mt-1.5 tracking-tight">{rx.patientName}</h4>
                    </div>
                  </div>
                  
                  {/* UTILITY HOVER CONTROLS */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => setActivePreview(rx)} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-xl transition-all" title="View Printable Script">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => { setEditingId(rx.id); setForm(rx); }} className="text-slate-400 hover:text-[#00A3E0] p-2 hover:bg-slate-50 rounded-xl transition-all" title="Edit Parameters">
                      <Edit size={15} />
                    </button>
                  </div>
                </div>

                {/* EXPANDED INNER CONTENT SUBSECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t border-slate-100 pt-4 text-xs">
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Clinical Diagnosis</p>
                    <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {rx.diagnosis}
                    </p>
                  </div>
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Medication Instructions</p>
                    <p className="font-semibold text-slate-600 mt-1 italic">“{rx.medications || "No active drugs attached."}”</p>
                  </div>
                </div>

                {rx.notes && (
                  <div className="mt-3 bg-amber-50/30 border border-amber-100/60 p-3 rounded-xl text-[11px] text-slate-500 font-medium">
                    <span className="font-black text-amber-600 uppercase text-[9px] tracking-wider block mb-0.5">Physiological / Care Advisory</span>
                    {rx.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- LIVE VIRTUAL PRESCRIPTION INTERACTIVE MODAL OVERLAY --- */}
      {activePreview && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Actions Header Bar */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <span className="text-xs font-black tracking-widest uppercase text-slate-400">Official Clinical Document Preview</span>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <Printer size={16} />
                </button>
                <button onClick={() => setActivePreview(null)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Simulated Medical Document Sheet */}
            <div className="p-8 flex-1 overflow-y-auto space-y-6 text-xs text-slate-800 font-medium">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
                <div>
                  <h3 className="text-base font-black tracking-tight text-slate-900 uppercase leading-none">MEDICARE INTEGRATED HEALTH</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Clinical Practice Portal Directory</span>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-500">
                  <p>ID: {activePreview.id}</p>
                  <p>Date: {activePreview.date}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Patient Entity</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{activePreview.patientName}</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Diagnostic Indications</p>
                <p className="font-bold text-slate-800 mt-0.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">{activePreview.diagnosis}</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Rx - Designated Formulations</p>
                <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-2xl font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {activePreview.medications || "No structured formulations added."}
                </div>
              </div>

              {activePreview.notes && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Advisory Directives</p>
                  <p className="text-slate-600 mt-1 italic leading-relaxed">“{activePreview.notes}”</p>
                </div>
              )}

              {/* Verified Electronic Signature Node */}
              <div className="pt-8 flex flex-col items-end text-right">
                <div className="w-40 border-b border-slate-300 pb-1 font-serif italic text-slate-500 text-sm tracking-wide">
                  Dr. Alexander Thorne
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">Authorized Electronic Signature</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}