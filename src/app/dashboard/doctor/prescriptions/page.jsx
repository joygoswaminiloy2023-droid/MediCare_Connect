"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  FilePlus, Edit, Eye, Pill, FileText, Activity, 
  FileCheck, X, Printer, Loader2, Search, Calendar,
  Trash2, Save, RefreshCw, UserCircle, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

function PrescriptionContent() {
  const searchParams = useSearchParams();

  // Pre-filled from appointments page
  const appointmentId = searchParams.get("appointmentId") || "";
  const patientIdFromUrl = searchParams.get("patientId") || "";
  const patientNameFromUrl = searchParams.get("patientName") || "";
  const doctorId = searchParams.get("doctorId") || "";
  const symptoms = searchParams.get("symptoms") || "";

  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activePreview, setActivePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [doctorEmail, setDoctorEmail] = useState("");

  const [form, setForm] = useState({
    patientId: patientIdFromUrl || "",
    diagnosis: symptoms ? `Based on symptoms: ${symptoms}` : "",
    medications: "",
    notes: "",
    followUpDate: "",
  });

  // ── Get current user session ──────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/get-session")
      .then(r => r.json())
      .then(data => {
        const user = data?.user || data?.data?.user;
        if (user?.email) {
          setDoctorEmail(user.email);
        }
      })
      .catch(() => {});
  }, []);

  // ── Load existing prescriptions ───────────────────────────────────────
  useEffect(() => {
    if (doctorEmail) {
      fetchPrescriptions();
    }
  }, [doctorEmail]);

  const fetchPrescriptions = async () => {
    if (!doctorEmail) return;
    
    setLoadingList(true);
    try {
      const res = await fetch(`${BACKEND}/api/doctors/prescriptions/list/${doctorEmail}`);
      const data = await res.json();

      if (data.success) {
        setPrescriptions(data.prescriptions || []);
      } else {
        toast.error(data.message || "Failed to fetch prescriptions");
      }
    } catch (error) {
      console.error("Fetch prescriptions error:", error);
      toast.error("Failed to load prescriptions");
    } finally {
      setLoadingList(false);
    }
  };

  // ── Submit prescription ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.patientId || !form.diagnosis) {
      toast.warning("Patient ID and diagnosis are required.");
      return;
    }

    if (editingId) {
      setSaving(true);
      try {
        const res = await fetch(`${BACKEND}/api/doctors/prescription/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diagnosis: form.diagnosis,
            medications: form.medications,
            notes: form.notes,
            followUpDate: form.followUpDate || null,
          }),
        });

        const data = await res.json();
        if (data.success) {
          toast.success("Prescription updated successfully!");
          setEditingId(null);
          resetForm();
          await fetchPrescriptions();
        } else {
          toast.error(data.message || "Failed to update prescription");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // ── Save to DB ────────────────────────────────────────────────────
    setSaving(true);
    try {
      const payload = {
        doctorId: doctorId || null,
        doctorEmail: doctorEmail || "",
        patientId: form.patientId, // ✅ Send patient ID only
        appointmentId: appointmentId || null,
        diagnosis: form.diagnosis,
        medications: form.medications,
        notes: form.notes,
        followUpDate: form.followUpDate || null,
      };

      console.log("📤 Sending prescription:", payload);

      const res = await fetch(`${BACKEND}/api/doctors/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Prescription saved! Appointment marked as completed.");
        resetForm();
        await fetchPrescriptions();
      } else {
        toast.error(data.message || "Failed to save prescription.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete Prescription ─────────────────────────────────────────────
  const handleDelete = async (prescriptionId) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;

    setDeletingId(prescriptionId);
    try {
      const res = await fetch(`${BACKEND}/api/doctors/prescription/${prescriptionId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Prescription deleted!");
        await fetchPrescriptions();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Reset Form ──────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      patientId: "",
      diagnosis: "",
      medications: "",
      notes: "",
      followUpDate: "",
    });
  };

  // ─── Cancel Editing ──────────────────────────────────────────────────
  const cancelEditing = () => {
    setEditingId(null);
    resetForm();
  };

  // ─── Edit Prescription ───────────────────────────────────────────────
  const handleEdit = (prescription) => {
    setEditingId(prescription._id);
    setForm({
      patientId: prescription.patientId || "",
      diagnosis: prescription.diagnosis || "",
      medications: prescription.medications || "",
      notes: prescription.notes || "",
      followUpDate: prescription.followUpDate || "",
    });
  };

  // ─── Format Date ─────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  // ─── Filter Prescriptions ────────────────────────────────────────────
  const filteredPrescriptions = prescriptions.filter(p => 
    p.patientId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Stats ────────────────────────────────────────────────────────────
  const totalPrescriptions = prescriptions.length;
  const totalPatients = new Set(prescriptions.map(p => p.patientId?.toString())).size;

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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl">
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Total</p>
              <p className="text-sm font-black text-slate-900">{totalPrescriptions}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Patients</p>
              <p className="text-sm font-black text-[#00A3E0]">{totalPatients}</p>
            </div>
          </div>
          <button
            onClick={fetchPrescriptions}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Pre-fill notice if coming from appointment */}
      {appointmentId && (
        <div className="bg-[#00A3E0]/5 border border-[#00A3E0]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
          <FileCheck className="text-[#00A3E0] flex-shrink-0" size={16} />
          <p className="text-xs text-slate-600">
            Writing prescription for <span className="font-black text-slate-800">{patientNameFromUrl}</span>.
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
              <button 
                onClick={cancelEditing} 
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Patient ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Patient ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={13} />
                </span>
                <input 
                  type="text" 
                  value={form.patientId}
                  onChange={e => setForm({ ...form, patientId: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] text-slate-700 transition-all"
                  placeholder="Patient ID" 
                  required 
                  disabled={!!editingId}
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Activity size={13} />
                </span>
                <input 
                  type="text" 
                  value={form.diagnosis}
                  onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] text-slate-700 transition-all"
                  placeholder="e.g. Acute Gastritis" 
                  required 
                />
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Medications
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400">
                  <Pill size={13} />
                </span>
                <textarea 
                  value={form.medications}
                  onChange={e => setForm({ ...form, medications: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0] h-20 resize-none text-slate-600 placeholder:text-slate-400/80 transition-all"
                  placeholder="Drug name, dosage, frequency..." 
                />
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Clinical Notes
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400">
                  <FileText size={13} />
                </span>
                <textarea 
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0] h-20 resize-none text-slate-600 transition-all"
                  placeholder="Rest, diet, follow-up instructions..." 
                />
              </div>
            </div>

            {/* Follow-up Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Follow-up Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Calendar size={13} />
                </span>
                <input 
                  type="date" 
                  value={form.followUpDate}
                  onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] text-slate-700 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className={`w-full text-white font-black py-3.5 rounded-xl text-xs transition-all tracking-wider uppercase shadow-md flex items-center justify-center gap-2 disabled:opacity-60 ${
                editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-[#00A3E0] hover:bg-[#0082b3]"
              }`}
            >
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                : editingId ? <><Save size={13} /> Update Prescription</> : <><FilePlus size={13} /> Save & Sign Prescription</>
              }
            </button>
          </form>
        </div>

        {/* ── Prescription List ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Issued Prescriptions</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">
                Saved to Prescriptions collection
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search by ID or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#00A3E0] transition-all w-48"
                />
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-xl font-bold">
                {filteredPrescriptions.length}
              </span>
            </div>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#00A3E0]" size={28} />
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white">
              <Pill className="text-slate-200 mx-auto mb-3" size={36} />
              <p className="text-slate-400 font-bold text-sm">No prescriptions yet.</p>
              <p className="text-slate-300 text-xs mt-1">Fill the form to issue your first prescription.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[640px] pr-1">
              <AnimatePresence>
                {filteredPrescriptions.map((rx, index) => {
                  // ✅ Get display info
                  const displayPatientId = rx.patientId || "Unknown";
                  const displayPatientName = rx.patientName || "";
                  
                  return (
                    <motion.div
                      key={rx._id?.toString() || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#00A3E0]/40 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-start">
                          <div className="bg-blue-50 text-[#00A3E0] p-2.5 rounded-xl mt-0.5">
                            <Pill size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-md tracking-wider uppercase">
                                RX
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {formatDate(rx.createdAt)}
                              </span>
                              {rx.followUpDate && (
                                <span className="text-[9px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                  Follow-up: {formatDate(rx.followUpDate)}
                                </span>
                              )}
                            </div>
                            {/* ✅ Patient ID Display */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <UserCircle size={16} className="text-[#00A3E0] flex-shrink-0" />
                              <h4 className="font-black text-slate-900 text-base tracking-tight">
                                Patient ID: {displayPatientId}
                              </h4>
                            </div>
                            {displayPatientName && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Name: {displayPatientName}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            onClick={() => setActivePreview(rx)}
                            className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-xl transition-all" 
                            title="Preview"
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            onClick={() => handleEdit(rx)}
                            className="text-slate-400 hover:text-[#00A3E0] p-2 hover:bg-slate-50 rounded-xl transition-all" 
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(rx._id)}
                            disabled={deletingId === rx._id}
                            className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50" 
                            title="Delete"
                          >
                            {deletingId === rx._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4 text-xs">
                        <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Diagnosis</p>
                          <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" /> 
                            {rx.diagnosis || "No diagnosis"}
                          </p>
                        </div>
                        <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Medications</p>
                          <p className="font-semibold text-slate-600 mt-1">
                            {rx.medications || "No medications added."}
                          </p>
                        </div>
                      </div>

                      {rx.notes && (
                        <div className="mt-3 bg-amber-50/30 border border-amber-100/60 p-3 rounded-xl text-[11px] text-slate-500 font-medium">
                          <span className="font-black text-amber-600 uppercase text-[9px] tracking-wider block mb-0.5">Notes</span>
                          {rx.notes}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {activePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]"
            >
              <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
                <span className="text-xs font-black tracking-widest uppercase text-slate-400">Prescription Preview</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <Printer size={16} />
                  </button>
                  <button 
                    onClick={() => setActivePreview(null)} 
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto space-y-6 text-xs text-slate-800 font-medium">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">MEDICARE CONNECT</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                      Clinical Practice Portal
                    </span>
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-500">
                    <p>Date: {formatDate(activePreview.createdAt)}</p>
                    {activePreview.followUpDate && (
                      <p className="text-amber-600">Follow-up: {formatDate(activePreview.followUpDate)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Patient ID</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {activePreview.patientId || "Unknown"}
                  </p>
                  {activePreview.patientName && (
                    <p className="text-xs text-slate-500">Name: {activePreview.patientName}</p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Diagnosis</p>
                  <p className="font-bold text-slate-800 mt-0.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    {activePreview.diagnosis}
                  </p>
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
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">
                    Electronic Signature
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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