"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2 } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { toast } from 'react-toastify';

const BACKEND = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export default function PatientProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: ""
  });

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        gender: session.user.gender || "",
        dateOfBirth: session.user.dateOfBirth || ""
      });
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Profile Settings</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          Manage your personal information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
        </div>

        <div className="p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Full Name</label>
            <div className="flex items-center gap-3">
              <User size={18} className="text-[#00A3E0]" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Email Address</label>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[#00A3E0]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Phone Number</label>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-[#00A3E0]" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880 1234 567890"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Date of Birth</label>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-[#00A3E0]" />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full bg-[#00A3E0] hover:bg-[#0082b3] text-white px-6 py-3 rounded-2xl text-sm font-black transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

    
    
    </div>
  );
}