"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Star, Plus, Edit2, Trash2, AlertCircle, Loader2, X, Check, MessageSquare } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onClick={() => !readonly && onChange && onChange(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star size={22}
            className={`transition-colors ${
              i <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();

  // Pre-filled from appointments page "Write Review" button
  const preDocId      = searchParams.get("doctorId")      || "";
  const preDocName    = searchParams.get("doctorName")    || "";
  const preApptId     = searchParams.get("appointmentId") || "";

  const [reviews, setReviews]           = useState([]);
  const [completedDoctors, setCompleted] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(!!preDocId); // auto-open if coming from appointment
  const [editingReview, setEditingReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [patientId, setPatientId]       = useState(null);

  const [form, setForm] = useState({
    doctorId:   preDocId,
    doctorName: preDocName,
    appointmentId: preApptId,
    rating:     5,
    reviewText: "",
  });

  const { data: session } = authClient.useSession();
  const patientEmail = session?.user?.email;

  useEffect(() => {
    if (!patientEmail) return;

    // Get patientId from session
    const user = session?.user;
    if (user?.id || user?._id) setPatientId(user.id || user._id);

    Promise.all([
      fetch(`${BACKEND}/api/patients/reviews/${patientEmail}`).then(r => r.json()),
      fetch(`${BACKEND}/api/patients/history/${patientEmail}`).then(r => r.json()),
    ])
      .then(([revData, aptData]) => {
        if (revData.success) setReviews(revData.reviews || []);
        if (aptData.success) {
          // Only completed appointments eligible for review
          const completed = aptData.appointments?.filter(a => a.appointmentStatus === "completed") || [];
          const reviewedDoctorIds = new Set((revData.reviews || []).map(r => r.doctorId?.toString()));
          // Unique unreviewed doctors
          const unique = [];
          completed.forEach(a => {
            const docId = a.doctorId?.toString();
            if (!reviewedDoctorIds.has(docId) && !unique.find(d => d.doctorId === docId)) {
              unique.push({ doctorId: docId, doctorName: a.doctorName, appointmentId: a._id?.toString() });
            }
          });
          setCompleted(unique);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientEmail]);

  const openAddModal = (doc = null) => {
    setEditingReview(null);
    setForm({
      doctorId:      doc?.doctorId      || "",
      doctorName:    doc?.doctorName    || "",
      appointmentId: doc?.appointmentId || "",
      rating:        5,
      reviewText:    "",
    });
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setForm({
      doctorId:      review.doctorId?.toString() || "",
      doctorName:    review.doctorName || "",
      appointmentId: review.appointmentId?.toString() || "",
      rating:        review.rating,
      reviewText:    review.reviewText,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.doctorId || !form.rating || !form.reviewText.trim()) {
      toast.error("Please fill all fields."); return;
    }
    setActionLoading("submit");

    try {
      if (editingReview) {
        // UPDATE
        const res  = await fetch(`${BACKEND}/api/patients/reviews/${editingReview._id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ rating: form.rating, reviewText: form.reviewText }),
        });
        const data = await res.json();
        if (data.success) {
          setReviews(prev => prev.map(r =>
            r._id === editingReview._id
              ? { ...r, rating: form.rating, reviewText: form.reviewText }
              : r
          ));
          toast.success("Review updated!");
          setShowModal(false);
        } else toast.error(data.message);

      } else {
        // ADD
        const res  = await fetch(`${BACKEND}/api/patients/reviews`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            patientId,
            patientEmail,
            doctorId:      form.doctorId,
            appointmentId: form.appointmentId || null,
            rating:        form.rating,
            reviewText:    form.reviewText,
          }),
        });
        const data = await res.json();
        if (data.success) {
          // Refetch to get populated review
          const updated = await fetch(`${BACKEND}/api/patients/reviews/${patientEmail}`).then(r => r.json());
          if (updated.success) setReviews(updated.reviews || []);
          // Remove from unreviewed list
          setCompleted(prev => prev.filter(d => d.doctorId !== form.doctorId));
          toast.success("Review submitted!");
          setShowModal(false);
          // Clear URL params
          router.replace("/dashboard/patient/reviews");
        } else toast.error(data.message);
      }
    } catch { toast.error("Network error."); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    setActionLoading(reviewId);
    try {
      const res  = await fetch(`${BACKEND}/api/patients/reviews/${reviewId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        toast.success("Review deleted.");
      } else toast.error(data.message);
    } catch { toast.error("Network error."); }
    finally { setActionLoading(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-[#00A3E0]" size={28} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">My Reviews</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Rate and review your doctors
          </p>
        </div>
        {completedDoctors.length > 0 && (
          <button onClick={() => openAddModal(completedDoctors[0])}
            className="flex items-center gap-2 bg-[#00A3E0] hover:bg-[#0082b3] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md">
            <Plus size={14} /> Write Review
          </button>
        )}
      </div>

      {/* Pending review notice */}
      {completedDoctors.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <MessageSquare className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              {completedDoctors.length} doctor{completedDoctors.length > 1 ? "s" : ""} waiting for your review!
            </p>
            <div className="flex gap-2 flex-wrap mt-2">
              {completedDoctors.map(doc => (
                <button key={doc.doctorId} onClick={() => openAddModal(doc)}
                  className="text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded-lg transition-colors">
                  Rate Dr. {doc.doctorName}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <Star className="text-slate-200 mx-auto mb-3" size={40} />
          <p className="text-slate-400 font-bold text-sm">No reviews yet.</p>
          <p className="text-slate-300 text-xs mt-1">Complete an appointment to leave a review.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review, i) => (
              <motion.div key={review._id?.toString()}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <h3 className="font-black text-slate-900">Dr. {review.doctorName || "Doctor"}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StarRating value={review.rating} readonly />
                      <span className="text-xs font-bold text-slate-600">{review.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(review)}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(review._id)}
                      disabled={actionLoading === review._id}
                      className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                      {actionLoading === review._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                  "{review.reviewText}"
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">

              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-black text-slate-900">
                  {editingReview ? "Edit Review" : `Review Dr. ${form.doctorName || "Doctor"}`}
                </h3>
                <button onClick={() => { setShowModal(false); router.replace("/dashboard/patient/reviews"); }}>
                  <X className="text-slate-400 hover:text-slate-600" size={20} />
                </button>
              </div>

              <div className="space-y-4">

                {/* Doctor select — only for new review */}
                {!editingReview && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Doctor</label>
                    <select value={form.doctorId}
                      onChange={e => {
                        const doc = completedDoctors.find(d => d.doctorId === e.target.value);
                        setForm(p => ({ ...p, doctorId: e.target.value, doctorName: doc?.doctorName || "", appointmentId: doc?.appointmentId || "" }));
                      }}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#00A3E0]">
                      <option value="">Select doctor</option>
                      {completedDoctors.map(doc => (
                        <option key={doc.doctorId} value={doc.doctorId}>Dr. {doc.doctorName}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Your Rating</label>
                  <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
                  <p className="text-xs text-slate-400 mt-1">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}</p>
                </div>

                {/* Review text */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Your Review</label>
                  <textarea value={form.reviewText}
                    onChange={e => setForm(p => ({ ...p, reviewText: e.target.value }))}
                    placeholder="Share your experience with this doctor..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#00A3E0] resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowModal(false); router.replace("/dashboard/patient/reviews"); }}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={actionLoading === "submit"}
                    className="flex-1 px-4 py-3 bg-[#00A3E0] text-white font-bold rounded-xl hover:bg-[#0082b3] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                    {actionLoading === "submit" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {editingReview ? "Update" : "Submit Review"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PatientReviews() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00A3E0]" size={28} /></div>}>
      <ReviewsContent />
    </Suspense>
  );
}