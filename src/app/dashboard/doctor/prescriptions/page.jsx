"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilePlus, Edit, Eye, Pill, FileText, User, Activity, FileCheck, X, Printer, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

function PrescriptionContent() {
  const searchParams  = useSearchParams();

  // Pre-filled from appointments page
  const appointmentId = searchParams.get("appointmentId") || "";
  const patientName   = searchParams.get("patientName")   || "";
  const patientId     = searchParams.get("patientId")     || "";
  const doctorId      = searchParams.get("doctorId")      || "";
  const symptoms      = searchParams.get("symptoms")      || "";

  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingList, setLoadingList]     = useState(true);
  const [saving, setSaving]               = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [activePreview, setActivePreview] = useState(null);

  const [form, setForm] = useState({
    patientName: patientName,
    diagnosis:   symptoms ? `Based on symptoms: ${symptoms}` : "",
    medications: "",
    notes:       "",
  });

  // ── Load existing prescriptions for this doctor ───────────────────────
  useEffect(() => {
    if (!doctorId) { setLoadingList(false); return; }
    fetch(`${BACKEND}/api/doctors/prescriptions/${doctorId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setPrescriptions(data.prescriptions); })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, [doctorId]);

  // ── Submit prescription ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.diagnosis) {
      toast.warning("Patient name and diagnosis are required.");
      return;
    }

    if (editingId) {
      // Local edit only (prescriptions are immutable in DB — new record for real edits)
      setPrescriptions(prev => prev.map(p =>
        p._id === editingId ? { ...p, ...form } : p
      ));
      toast.success("Prescription updated locally.");
      setEditingId(null);
      setForm({ patientName: "", diagnosis: "", medications: "", notes: "" });
      return;
    }

    // ── Save to DB ────────────────────────────────────────────────────
    if (!appointmentId || !doctorId) {
      toast.error("Missing appointment or doctor info. Please come from the appointments page.");
      return;
    }

    setSaving(true);
    try {
      const res  = await fetch(`${BACKEND}/api/doctors/prescriptions`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          patientId:     patientId || null,
          appointmentId,
          diagnosis:     form.diagnosis,
          medications:   form.medications,
          notes:         form.notes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Add to local list with form data for immediate display
        const newRx = {
          _id:          data.prescriptionId,
          patientName:  form.patientName,
          diagnosis:    form.diagnosis,
          medications:  form.medications,
          notes:        form.notes,
          createdAt:    new Date().toISOString(),
        };
        setPrescriptions(prev => [newRx, ...prev]);
        toast.success("Prescription saved! Appointment marked as completed.");
        setForm({ patientName: "", diagnosis: "", medications: "", notes: "" });
      } else {
        toast.error(data.message || "Failed to save prescription.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm({ patientName: patientName, diagnosis: "", medications: "", notes: "" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="w-full space-y-8 text-slate-800">

      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">PRESCRIPTION ENGINE</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Generate and manage patient prescriptions
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50/60 text-emerald-600 border border-emerald-100 px-4 py-2.5 rounded-2xl text-xs font-bold">
          <FileCheck size={15} /> Records saved to Prescriptions DB
        </div>
      </div>

      {/* Pre-fill notice if coming from appointment */}
      {appointmentId && (
        <div className="bg-[#00A3E0]/5 border border-[#00A3E0]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
          <FileCheck className="text-[#00A3E0] flex-shrink-0" size={16} />
          <p className="text-xs text-slate-600">
            Writing prescription for <span className="font-black text-slate-800">{patientName}</span>.
            After saving, this appointment will be marked as <span className="font-black text-emerald-600">Completed</span>.
          </p>
        </div>
      )}

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FilePlus size={14} className="text-[#00A3E0]" />
              {editingId ? "Edit Prescription" : "New Prescription"}
            </h3>
            {editingId && (
              <button onClick={cancelEditing} className="text-[10px] font-bold text-rose-500 hover:underline">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Patient Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Patient Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><User size={13} /></span>
                <input type="text" value={form.patientName}
                  onChange={e => setForm({ ...form, patientName: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] text-slate-700"
                  placeholder="Full patient name" required />
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Diagnosis</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Activity size={13} /></span>
                <input type="text" value={form.diagnosis}
                  onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] text-slate-700"
                  placeholder="e.g. Acute Gastritis" required />
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Medications</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400"><Pill size={13} /></span>
                <textarea value={form.medications}
                  onChange={e => setForm({ ...form, medications: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0] h-24 resize-none text-slate-600 placeholder:text-slate-400/80"
                  placeholder="Drug name, dosage, frequency..." />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Clinical Notes</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400"><FileText size={13} /></span>
                <textarea value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0] h-20 resize-none text-slate-600"
                  placeholder="Rest, diet, follow-up instructions..." />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className={`w-full text-white font-black py-3 rounded-xl text-xs transition-all tracking-wider uppercase shadow-md flex items-center justify-center gap-2 disabled:opacity-60 ${
                editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-900 hover:bg-slate-800"
              }`}>
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                : editingId ? "Update Prescription" : "Save & Sign Prescription"
              }
            </button>
          </form>
        </div>

        {/* ── Prescription List ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Issued Prescriptions</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">Saved to Prescriptions collection</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-bold">
              {prescriptions.length} Records
            </span>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#00A3E0]" size={24} />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white">
              <Pill className="text-slate-200 mx-auto mb-3" size={36} />
              <p className="text-slate-400 font-bold text-sm">No prescriptions yet.</p>
              <p className="text-slate-300 text-xs mt-1">Fill the form to issue your first prescription.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[640px] pr-1">
              {prescriptions.map(rx => (
                <div key={rx._id?.toString()} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#00A3E0]/40 transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      <div className="bg-blue-50 text-[#00A3E0] p-2.5 rounded-xl mt-0.5">
                        <Pill size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-md tracking-wider uppercase">
                            RX
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{formatDate(rx.createdAt)}</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-base mt-1.5 tracking-tight">
                          {rx.patientName || "Patient"}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => setActivePreview(rx)}
                        className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-xl transition-all" title="Preview">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => { setEditingId(rx._id?.toString()); setForm({ patientName: rx.patientName || "", diagnosis: rx.diagnosis || "", medications: rx.medications || "", notes: rx.notes || "" }); }}
                        className="text-slate-400 hover:text-[#00A3E0] p-2 hover:bg-slate-50 rounded-xl transition-all" title="Edit">
                        <Edit size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4 text-xs">
                    <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Diagnosis</p>
                      <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" /> {rx.diagnosis}
                      </p>
                    </div>
                    <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Medications</p>
                      <p className="font-semibold text-slate-600 mt-1 italic">
                        "{rx.medications || "No medications added."}"
                      </p>
                    </div>
                  </div>

                  {rx.notes && (
                    <div className="mt-3 bg-amber-50/30 border border-amber-100/60 p-3 rounded-xl text-[11px] text-slate-500 font-medium">
                      <span className="font-black text-amber-600 uppercase text-[9px] tracking-wider block mb-0.5">Notes</span>
                      {rx.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Modal ─────────────────────────────────────────────── */}
      {activePreview && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <span className="text-xs font-black tracking-widest uppercase text-slate-400">Prescription Preview</span>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <Printer size={16} />
                </button>
                <button onClick={() => setActivePreview(null)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto space-y-6 text-xs text-slate-800 font-medium">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
                <div>
                  <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">MEDICARE CONNECT</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Clinical Practice Portal</span>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-500">
                  <p>Date: {formatDate(activePreview.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Patient</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{activePreview.patientName}</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Diagnosis</p>
                <p className="font-bold text-slate-800 mt-0.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">{activePreview.diagnosis}</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Rx — Medications</p>
                <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-2xl font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {activePreview.medications || "No medications prescribed."}
                </div>
              </div>

              {activePreview.notes && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clinical Notes</p>
                  <p className="text-slate-600 mt-1 italic leading-relaxed">"{activePreview.notes}"</p>
                </div>
              )}

              <div className="pt-8 flex flex-col items-end text-right">
                <div className="w-40 border-b border-slate-300 pb-1 font-serif italic text-slate-500 text-sm tracking-wide">
                  Authorized Signature
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">Electronic Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrescriptionManagementDashboard() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#00A3E0]" size={28} />
      </div>
    }>
      <PrescriptionContent />
    </Suspense>
  );
}