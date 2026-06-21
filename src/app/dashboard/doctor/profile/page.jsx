"use client";
import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Camera, GraduationCap, Briefcase, DollarSign, Clock, Loader2, Stethoscope, Building, Mail, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { create_doc } from '@/lib/actions/doctor'; 

const IMGBB_API_KEY = "cb2754130c44d32a72e7dafee349d489"; 

export default function DoctorProfileManagement() {
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
        // 🎯 Fetch live session data straight from your better-auth API endpoint
        const authRes = await fetch('/api/auth/get-session'); 
        if (authRes.ok) {
          const sessionData = await authRes.json();
          // Adjust paths based on your exact better-auth response shape (typically data.user)
          const user = sessionData?.user || sessionData?.data?.user || sessionData;
          
          if (user && user.email) {
            sessionEmail = user.email;
            sessionName = user.name || "";
            sessionImage = user.image || "";
          }
        }
      } catch (err) {
        console.warn("Could not retrieve active session from auth endpoint:", err);
      }

      // Fallback UI preview image assignment
      if (sessionImage) {
        setPreviewUrl(sessionImage);
      }

      if (!sessionEmail) {
        toast.warning("Auth session data could not be auto-loaded. Please enter fields manually.");
        setLoading(false);
        return;
      }

      // Sync existing profile values from MongoDB if they exist
      try {
        const dbRes = await fetch(`http://localhost:5000/api/doctors/profile?email=${encodeURIComponent(sessionEmail)}`);
        if (dbRes.ok) {
          const dbData = await dbRes.json();
          setProfile({
            doctorName: dbData.doctorName || sessionName || "",
            email: sessionEmail,
            specialization: dbData.specialization || "",
            qualifications: Array.isArray(dbData.qualifications) ? dbData.qualifications.join(', ') : dbData.qualifications || "",
            experience: dbData.experience || "",
            consultationFee: dbData.consultationFee || "",
            hospitalName: dbData.hospitalName || "",
            availableSlots: Array.isArray(dbData.availableSlots) ? dbData.availableSlots.join(', ') : dbData.availableSlots || "",
            profileImage: dbData.profileImage || sessionImage || ""
          });
          if (dbData.profileImage) {
            setPreviewUrl(dbData.profileImage);
          }
        } else {
          throw new Error("No database profile found.");
        }
      } catch (error) {
        // Initialize form with auth session data if no database profile exists yet
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
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
    toast.success("Please wait until the admin approves your request.");
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
      <div className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 uppercase">CREATE PRACTITIONER PROFILE</h2>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-0.5">Initialize clinical registration schema records</p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 h-24 w-full bg-gradient-to-r from-slate-900 to-slate-800 left-0" />
            <div className="relative mt-10">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-slate-100 shadow-lg">
                <Image width={256} height={256} src={previewUrl} alt="Dashboard Live Avatar" className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-1 right-1 bg-[#00A3E0] hover:bg-[#0082b3] text-white p-2.5 rounded-full shadow-md cursor-pointer border-2 border-white">
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} strokeWidth={2.5} />}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isUploading} />
              </label>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-black text-slate-900">{profile.doctorName || "New Practitioner"}</h3>
              <div className="mt-2 text-[10px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 font-bold">
                {profile.email || "No Email Bound"}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Email Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-[#00A3E0]" /> Account Email Address (Required Cluster Link)
                  </label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" placeholder="Enter verification index email..." required />
                </div>

                {/* Doctor Name Field */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-[#00A3E0]" /> Practitioner Legal Full Name
                  </label>
                  <input type="text" value={profile.doctorName} onChange={(e) => setProfile({ ...profile, doctorName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" placeholder="e.g. Dr. Jane Doe" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope size={12} className="text-[#00A3E0]" /> Medical Specialization
                  </label>
                  <input type="text" value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" placeholder="e.g. Cardiology, Neurology" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={12} className="text-[#00A3E0]" /> Hospital Affiliation
                  </label>
                  <input type="text" value={profile.hospitalName} onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" placeholder="e.g. Metro General Hospital" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-[#00A3E0]" /> Degrees & Board Qualifications
                  </label>
                  <input type="text" value={profile.qualifications} onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" placeholder="Comma-separated: MD, MBBS" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={12} className="text-[#00A3E0]" /> Years of Active Experience
                  </label>
                  <input type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" placeholder="e.g. 12" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={12} className="text-[#00A3E0]" /> Consultation Session Fee (USD)
                  </label>
                  <input type="number" value={profile.consultationFee} onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-[#00A3E0]" placeholder="e.g. 150" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-[#00A3E0]" /> Standard Available Slots
                  </label>
                  <input type="text" value={profile.availableSlots} onChange={(e) => setProfile({ ...profile, availableSlots: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:border-[#00A3E0]" placeholder="Comma-separated: 9:00, 10:30" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> Synced to Database cluster collection "Doctor".
                </p>
                <button type="submit" disabled={isUploading || isSaving} className="w-full sm:w-auto bg-[#00A3E0] hover:bg-[#0082b3] text-white font-black text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
                  INITIALIZE AND CREATE PROFILE
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}