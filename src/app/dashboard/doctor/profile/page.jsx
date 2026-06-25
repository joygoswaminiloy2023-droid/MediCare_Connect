"use client";
import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Camera, GraduationCap, Briefcase, DollarSign, Clock, Loader2, Stethoscope, Building, Mail, User, AlertCircle, CheckCircle, Clock as ClockIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { create_doc } from '@/lib/actions/doctor';
import { motion } from 'framer-motion';

const IMGBB_API_KEY = "cb2754130c44d32a72e7dafee349d489";
const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function DoctorProfileManagement() {
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // ✅ STATUS TRACKING
  const [profileStatus, setProfileStatus] = useState(null); // "approved", "pending", "none"
  const [statusMessage, setStatusMessage] = useState("");
  
  const [profile, setProfile] = useState({
    doctorName: "", 
    email: "", 
    specialization: "",
    qualifications: "", 
    experience: "", 
    consultationFee: "", 
    hospitalName: "",
    availableSlots: "", 
    profileImage: "" 
  });

  const [previewUrl, setPreviewUrl] = useState("https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80");

  useEffect(() => {
    async function initializeAuthAndProfile() {
      let sessionEmail = "";
      let sessionName = "";
      let sessionImage = "";

      try {
        const authRes = await fetch('/api/auth/get-session'); 
        if (authRes.ok) {
          const sessionData = await authRes.json();
          const user = sessionData?.user || sessionData?.data?.user || sessionData;
          
          if (user && user.email) {
            sessionEmail = user.email;
            sessionName = user.name || "";
            sessionImage = user.image || "";
          }
        }
      } catch (err) {
        console.warn("Could not retrieve active session:", err);
      }

      if (sessionImage) {
        setPreviewUrl(sessionImage);
      }

      if (!sessionEmail) {
        toast.warning("Auth session data could not be auto-loaded. Please enter fields manually.");
        setLoading(false);
        return;
      }

      // ✅ CHECK PROFILE STATUS WITH NEW ENDPOINT
      await checkProfileStatus(sessionEmail);

      // Sync existing profile values from MongoDB
      try {
        const dbRes = await fetch(`${BACKEND}/api/doctors/profile/${encodeURIComponent(sessionEmail)}`);
        if (dbRes.ok) {
          const dbData = await dbRes.json();
          const profileData = dbData.profile || dbData;
          
          setProfile({
            doctorName: profileData.doctorName || sessionName || "",
            email: sessionEmail,
            specialization: profileData.specialization || "",
            qualifications: Array.isArray(profileData.qualifications) ? profileData.qualifications.join(', ') : profileData.qualifications || "",
            experience: profileData.experience || "",
            consultationFee: profileData.consultationFee || "",
            hospitalName: profileData.hospitalName || "",
            availableSlots: Array.isArray(profileData.availableSlots) ? profileData.availableSlots.join(', ') : profileData.availableSlots || "",
            profileImage: profileData.profileImage || profileData.image || sessionImage || ""
          });
          
          if (profileData.profileImage || profileData.image) {
            setPreviewUrl(profileData.profileImage || profileData.image);
          }
        } else {
          throw new Error("No database profile found.");
        }
      } catch (error) {
        setProfile({
          doctorName: sessionName,
          email: sessionEmail,
          specialization: "",
          qualifications: "",
          experience: "",
          consultationFee: "",
          hospitalName: "",
          availableSlots: "",
          profileImage: sessionImage
        });
      } finally {
        setLoading(false);
      }
    }

    initializeAuthAndProfile();
  }, []);

  // ✅ NEW: Check profile status
  const checkProfileStatus = async (email) => {
    try {
      const res = await fetch(`${BACKEND}/api/doctors/profile-status/${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (data.success) {
        setProfileStatus(data.status);
        setStatusMessage(data.message);
      }
    } catch (err) {
      console.error("Status check error:", err);
    }
  };

  // ✅ REFRESH STATUS (Manual refresh button)
  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await checkProfileStatus(profile.email);
      toast.success("Status refreshed!");
    } catch (err) {
      toast.error("Failed to refresh status");
    } finally {
      setRefreshing(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();
      if (data.success) {
        setPreviewUrl(data.data.url);
        setProfile(prev => ({ ...prev, profileImage: data.data.url })); 
        toast.success("Profile avatar successfully hosted!");
      }
    } catch (err) {
      toast.error("Image cloud hosting pipeline failure.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (!profile.email || profile.email.trim() === "") {
      toast.error("Validation error: Account email verification identity missing.");
      return;
    }

    setIsSaving(true);

    const payload = {
      ...profile,
      experience: profile.experience ? Number(profile.experience) : 0,
      consultationFee: profile.consultationFee ? Number(profile.consultationFee) : 0
    };

    try {
      const result = await create_doc(payload);
      if (result.success) {
        toast.success("✅ Profile submitted for admin review.");
        // ✅ REFRESH STATUS AFTER SUBMISSION
        await checkProfileStatus(profile.email);
      } else {
        toast.error(result.message || "Failed to process database sync request.");
      }
    } catch (error) {
      toast.error("Network communication exception encountered.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-[#00A3E0]" size={28} />
        <span className="text-xs font-bold uppercase tracking-widest">Loading Dashboard Profiles...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-slate-800">
      {/* Header */}
      <div className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 uppercase">CREATE PRACTITIONER PROFILE</h2>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-0.5">Initialize clinical registration schema records</p>
      </div>

      {/* ✅ STATUS BANNER */}
      {profileStatus === "approved" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={28} />
            </div>
            <div>
              <p className="font-black text-emerald-900 text-lg">✅ Profile Approved!</p>
              <p className="text-sm text-emerald-700 mt-1">Your profile is live and visible to patients.</p>
            </div>
          </div>
          <button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
          >
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : "Refresh"}
          </button>
        </motion.div>
      )}

      {profileStatus === "pending" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center animate-pulse">
              <ClockIcon className="text-amber-600" size={28} />
            </div>
            <div>
              <p className="font-black text-amber-900 text-lg">⏳ Under Review</p>
              <p className="text-sm text-amber-700 mt-1">Your profile is being reviewed by admins. You'll be notified when approved.</p>
            </div>
          </div>
          <button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
          >
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : "Refresh"}
          </button>
        </motion.div>
      )}

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 h-24 w-full bg-gradient-to-r from-slate-900 to-slate-800 left-0" />
            <div className="relative mt-10">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-slate-100 shadow-lg">
                <Image 
                  width={256} 
                  height={256} 
                  src={previewUrl} 
                  alt="Dashboard Live Avatar" 
                  className="w-full h-full object-cover" 
                  unoptimized
                />
              </div>
              <label className="absolute bottom-1 right-1 bg-[#00A3E0] hover:bg-[#0082b3] text-white p-2.5 rounded-full shadow-md cursor-pointer border-2 border-white">
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} strokeWidth={2.5} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  disabled={isUploading} 
                />
              </label>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-black text-slate-900">{profile.doctorName || "New Practitioner"}</h3>
              <div className="mt-2 text-[10px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 font-bold">
                {profile.email || "No Email Bound"}
              </div>
              
              {/* ✅ STATUS BADGE */}
              {profileStatus && (
                <div className="mt-4">
                  {profileStatus === "approved" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-300">
                      <CheckCircle size={12} /> VERIFIED & LIVE
                    </span>
                  )}
                  {profileStatus === "pending" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-700 border border-amber-300 animate-pulse">
                      <ClockIcon size={12} /> UNDER REVIEW
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Email Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-[#00A3E0]" /> Account Email Address (Required Cluster Link)
                  </label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
                    disabled={profileStatus === "approved"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0] disabled:bg-slate-100 disabled:cursor-not-allowed" 
                    placeholder="Enter verification index email..." 
                    required 
                  />
                </div>

                {/* Doctor Name Field */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-[#00A3E0]" /> Practitioner Legal Full Name
                  </label>
                  <input 
                    type="text" 
                    value={profile.doctorName} 
                    onChange={(e) => setProfile({ ...profile, doctorName: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" 
                    placeholder="e.g. Dr. Jane Doe" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope size={12} className="text-[#00A3E0]" /> Medical Specialization
                  </label>
                  <input 
                    type="text" 
                    value={profile.specialization} 
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" 
                    placeholder="e.g. Cardiology, Neurology" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={12} className="text-[#00A3E0]" /> Hospital Affiliation
                  </label>
                  <input 
                    type="text" 
                    value={profile.hospitalName} 
                    onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" 
                    placeholder="e.g. Metro General Hospital" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-[#00A3E0]" /> Degrees & Board Qualifications
                  </label>
                  <input 
                    type="text" 
                    value={profile.qualifications} 
                    onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" 
                    placeholder="Comma-separated: MD, MBBS" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={12} className="text-[#00A3E0]" /> Years of Active Experience
                  </label>
                  <input 
                    type="number" 
                    value={profile.experience} 
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" 
                    placeholder="e.g. 12" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={12} className="text-[#00A3E0]" /> Consultation Session Fee (USD)
                  </label>
                  <input 
                    type="number" 
                    value={profile.consultationFee} 
                    onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" 
                    placeholder="e.g. 150" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-[#00A3E0]" /> Standard Available Slots
                  </label>
                  <input 
                    type="text" 
                    value={profile.availableSlots} 
                    onChange={(e) => setProfile({ ...profile, availableSlots: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0]" 
                    placeholder="Comma-separated: 9:00, 10:30" 
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> Synced to Database cluster collection "Doctor".
                </p>
                <button 
                  type="submit" 
                  disabled={isUploading || isSaving || profileStatus === "approved"} 
                  className="w-full sm:w-auto bg-[#00A3E0] hover:bg-[#0082b3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Submitting...
                    </>
                  ) : profileStatus === "approved" ? (
                    <>
                      <CheckCircle size={14} /> Already Approved
                    </>
                  ) : profileStatus === "pending" ? (
                    <>
                      <ClockIcon size={14} className="animate-pulse" /> Update & Resubmit
                    </>
                  ) : (
                    <>
                      <Save size={14} strokeWidth={2.5} /> Initialize and Create Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}