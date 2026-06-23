"use client";
import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit2, Trash2, AlertCircle, Loader2, X, Check, MessageSquare } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function PatientReviews() {
  const [reviews, setReviews] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [patientId, setPatientId] = useState(null);

  const [formData, setFormData] = useState({ doctorId: "", rating: 5, reviewText: "" });

  const { data: session } = authClient.useSession();
  const patientEmail = session?.user?.email;

  useEffect(() => {
    if (!patientEmail) return;

    Promise.all([
      fetch(`${BACKEND}/api/patients/reviews/${patientEmail}`).then(r => r.json()),
      fetch(`${BACKEND}/api/patients/history/${patientEmail}`).then(r => r.json()),
      fetch("/api/auth/get-session").then(r => r.json())
    ])
      .then(([revData, aptData, sessData]) => {
        if (revData.success) setReviews(revData.reviews || []);
        if (aptData.success) setAppointments(aptData.appointments || []);
        const user = sessData?.user || sessData?.data?.user;
        if (user?._id) setPatientId(user._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientEmail]);

  // Get unreviewed doctors
  const reviewedDoctorIds = new Set(reviews.map(r => r.doctorId?.toString()));
  const unreviewedDoctors = appointments
    .filter(a => !reviewedDoctorIds.has(a.doctorId?.toString()) && a.appointmentStatus === "completed")
    .reduce((acc, a) => {
      const exists = acc.find(d => d.doctorId === a.doctorId);
      return exists ? acc : [...acc, { doctorName: a.doctorName, doctorId: a.doctorId }];
    }, []);

  // Handle Add Review
  const handleAddReview = async () => {
    if (!formData.doctorId || !formData.rating || !formData.reviewText.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/patients/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientEmail,
          doctorId: formData.doctorId,
          rating: formData.rating,
          reviewText: formData.reviewText
        })
      });

      const data = await res.json();
      if (data.success) {
        // Refetch reviews
        const updatedReviews = await fetch(`${BACKEND}/api/patients/reviews/${patientEmail}`).then(r => r.json());
        if (updatedReviews.success) setReviews(updatedReviews.reviews || []);
        
        toast.success("Review added!");
        setShowAddModal(false);
        setFormData({ doctorId: "", rating: 5, reviewText: "" });
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Update Review
  const handleUpdateReview = async () => {
    if (!formData.rating || !formData.reviewText.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/patients/reviews/${selectedReview._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: formData.rating,
          reviewText: formData.reviewText
        })
      });

      const data = await res.json();
      if (data.success) {
        setReviews(prev =>
          prev.map(r => r._id === selectedReview._id
            ? { ...r, rating: formData.rating, reviewText: formData.reviewText }
            : r
          )
        );
        toast.success("Review updated!");
        setShowEditModal(false);
        setSelectedReview(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/patients/reviews/${reviewId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        toast.success("Review deleted!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#00A3E0] mx-auto mb-3" size={28} />
        <p className="text-slate-400 text-xs font-bold uppercase">Loading reviews...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">My Reviews</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Rate and review your doctors
          </p>
        </div>
        {unreviewedDoctors.length > 0 && (
          <button
            onClick={() => {
              setFormData({ doctorId: unreviewedDoctors[0].doctorId, rating: 5, reviewText: "" });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[#00A3E0] hover:bg-[#0082b3] text-white px-4 py-2 rounded-2xl text-xs font-bold transition-all"
          >
            <Plus size={14} />
            Add Review
          </button>
        )}
      </div>

      {/* Add Review Button */}
      {unreviewedDoctors.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <MessageSquare className="text-blue-600 flex-shrink-0 mt-1" size={18} />
          <div>
            <p className="text-sm font-bold text-blue-900">You have unreviewed doctors!</p>
            <p className="text-xs text-blue-700 mt-1">{unreviewedDoctors.length} doctor(s) are waiting for your feedback.</p>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center"
        >
          <Star className="text-slate-200 mx-auto mb-3" size={40} />
          <p className="text-slate-400 font-bold text-sm">No reviews yet. Rate your favorite doctors!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review, i) => (
              <motion.div
                key={review._id?.toString()}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-sm">Dr. {review.doctorName || "Unknown"}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">{review.rating}/5</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setFormData({ doctorId: review.doctorId, rating: review.rating, reviewText: review.reviewText });
                        setShowEditModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{review.reviewText}</p>
                <p className="text-[10px] text-slate-400 mt-3">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Review Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900">Add Review</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Doctor</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-sm font-semibold"
                  >
                    <option value="">Select a doctor</option>
                    {unreviewedDoctors.map(doc => (
                      <option key={doc.doctorId} value={doc.doctorId}>
                        Dr. {doc.doctorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        onClick={() => setFormData(prev => ({ ...prev, rating: i }))}
                        className="flex-1"
                      >
                        <Star
                          size={24}
                          className={i <= formData.rating ? "text-amber-500 fill-amber-500" : "text-slate-300 cursor-pointer"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Review</label>
                  <textarea
                    value={formData.reviewText}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                    placeholder="Share your experience..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-sm font-semibold resize-none h-24"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddReview}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-[#00A3E0] text-white font-bold rounded-2xl hover:bg-[#0082b3] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Review Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900">Edit Review</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        onClick={() => setFormData(prev => ({ ...prev, rating: i }))}
                        className="flex-1"
                      >
                        <Star
                          size={24}
                          className={i <= formData.rating ? "text-amber-500 fill-amber-500" : "text-slate-300 cursor-pointer"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Review</label>
                  <textarea
                    value={formData.reviewText}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-sm font-semibold resize-none h-24"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateReview}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-[#00A3E0] text-white font-bold rounded-2xl hover:bg-[#0082b3] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Update
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