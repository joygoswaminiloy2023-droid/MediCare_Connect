"use client";
import { useEffect, useState } from "react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // tracks which card is loading

  // Fetch all doctors (pending + approved)
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/doctors");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve a pending application
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/doctors/verify/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state: mark as verified
        setDoctors(prev =>
          prev.map(doc =>
            doc._id?.toString() === id
              ? { ...doc, verificationStatus: "verified" }
              : doc
          )
        );
      } else {
        alert("Approval failed: " + data.message);
      }
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Revoke an approved doctor back to pending
  const handleRevoke = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/doctors/verify/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: false }),
      });
      const data = await res.json();
      if (data.success) {
        setDoctors(prev =>
          prev.map(doc =>
            doc._id?.toString() === id
              ? { ...doc, verificationStatus: "pending" }
              : doc
          )
        );
      } else {
        alert("Revoke failed: " + data.message);
      }
    } catch (err) {
      console.error("Revoke error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Permanently reject and delete a pending application
  const handleReject = async (id) => {
    if (!confirm("Permanently reject this application? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/doctors/reject/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDoctors(prev => prev.filter(doc => doc._id?.toString() !== id));
      } else {
        alert("Rejection failed: " + data.message);
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const pending = doctors.filter(d => d.verificationStatus === "pending");
  const approved = doctors.filter(d => d.verificationStatus === "verified");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading practitioners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Manage Practitioners</h1>
      <p className="text-gray-500 text-sm mb-8">
        Review pending applications and manage verified doctors.
      </p>

      {/* ── PENDING APPLICATIONS ───────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Pending Applications</h2>
          <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
            No pending applications right now.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map(doc => (
              <DoctorCard
                key={doc._id}
                doc={doc}
                status="pending"
                isLoading={actionLoading === doc._id?.toString()}
                onApprove={() => handleApprove(doc._id?.toString())}
                onReject={() => handleReject(doc._id?.toString())}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── VERIFIED DOCTORS ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Verified Doctors</h2>
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {approved.length}
          </span>
        </div>

        {approved.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
            No approved doctors yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map(doc => (
              <DoctorCard
                key={doc._id}
                doc={doc}
                status="verified"
                isLoading={actionLoading === doc._id?.toString()}
                onRevoke={() => handleRevoke(doc._id?.toString())}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Doctor Card Component ──────────────────────────────────────────────────
function DoctorCard({ doc, status, isLoading, onApprove, onReject, onRevoke }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <img
          src={doc.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
          alt={doc.doctorName}
          className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0"
          onError={e => { e.target.src = "https://via.placeholder.com/48?text=Dr"; }}
        />
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">{doc.doctorName}</p>
          <p className="text-sm text-blue-600 truncate">{doc.specialization}</p>
          <p className="text-xs text-gray-400 truncate">{doc.hospitalName}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-xs text-gray-500 mb-4">
        <p>🎓 {doc.degrees}</p>
        <p>🏥 {doc.experience} years experience</p>
        <p>💲 ${doc.consultationFee} consultation fee</p>
        <p className="truncate">📧 {doc.email}</p>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {status === "pending" && (
          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs px-2.5 py-1 rounded-full">
            ⏳ Awaiting Approval
          </span>
        )}
        {status === "verified" && (
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full">
            ✅ Verified & Live
          </span>
        )}
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {isLoading ? "..." : "✅ Approve"}
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {isLoading ? "..." : "❌ Reject"}
          </button>
        </div>
      )}

      {status === "verified" && (
        <button
          onClick={onRevoke}
          disabled={isLoading}
          className="w-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-600 border border-gray-200 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : "↩ Revoke Verification"}
        </button>
      )}
    </div>
  );
}