"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, CheckCircle2, User, Stethoscope } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";
import { FaHeartbeat } from "react-icons/fa";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", email: "", password: "", image: "", role: "patient" }
  });

  // Watch the role value live to update button selection active styles instantly
  const currentRole = watch("role");

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    reset({ name: "", email: "", password: "", image: "", role: "patient" });
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      toast.error("Google authentication failed.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = isLogin
        ? await authClient.signIn.email({ 
            email: data.email, 
            password: data.password, 
            callbackURL: "/" 
          })
        : await authClient.signUp.email({ 
            name: data.name, 
            email: data.email, 
            password: data.password, 
            image: data.image, 
            role: data.role, 
            callbackURL: "/" 
          });

      if (response?.error) {
        toast.error(response.error.message || "Authentication failed");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-200 p-4 md:p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="relative w-full max-w-[1000px] min-h-[720px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* --- FORM CONTAINER --- */}
        <div 
          className={`w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 py-10 transition-all duration-700 ease-in-out z-10 ${
            isLogin ? "md:translate-x-0" : "md:translate-x-full"
          }`}
        >
          <div className="mb-4 mt-10">
            <div className="flex justify-center md:justify-start items-center gap-2 mb-2">
              <FaHeartbeat className="w-6 h-6 animate-pulse text-[#00A3E0]" />
              <span className="font-bold text-xl text-[#00A3E0]">Medicare-Connect</span>
            </div>
            <h2 className="text-3xl text-center md:text-left font-bold text-slate-900">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {!isLogin && (
              <>
                {/* ROLE SELECTION CONTAINER */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Account Type</label>
                  
                  {/* Patient & Doctor Selector Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("role", "patient", { shouldValidate: true })}
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-semibold text-xs transition-all ${
                        currentRole === "patient"
                          ? "border-[#00A3E0] bg-[#e6f6fc] text-[#00A3E0] shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <User size={16} />
                      Patient
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setValue("role", "doctor", { shouldValidate: true })}
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-semibold text-xs transition-all ${
                        currentRole === "doctor"
                          ? "border-[#00A3E0] bg-[#e6f6fc] text-[#00A3E0] shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Stethoscope size={16} />
                      Doctor
                    </button>
                  </div>

                  {/* Subtle Admin Selector option */}
                  <div className="flex items-center justify-start pt-1">
                    <button
                      type="button"
                      onClick={() => setValue("role", "admin", { shouldValidate: true })}
                      className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                        currentRole === "admin" ? "text-[#00A3E0] font-bold" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${currentRole === "admin" ? "border-[#00A3E0]" : "border-slate-300"}`}>
                        {currentRole === "admin" && <div className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />}
                      </div>
                      Register as System Admin
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Your Name"
                    {...register("name", { required: !isLogin })} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00A3E0] transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Image URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/photo.jpg"
                    {...register("image")} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00A3E0] transition-all" 
                  />
                </div>
              </>
            )}
            
            <div className="space-y-1 md:mt-20 mt-0">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <input 
                type="email" 
                {...register("email", { required: true })} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00A3E0]" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...register("password", { required: true })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00A3E0]" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#00A3E0] hover:bg-[#0a8ebe] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-4">
              {isSubmitting ? "..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400">Or continue with</span></div>
          </div>

          <button onClick={handleGoogleSignIn} type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p className="mt-4 text-center text-slate-500 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleAuthMode} className="ml-2 text-[#00A3E0] font-bold underline">
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        {/* --- DECORATIVE PANEL WITH IMAGE BACKGROUND --- */}
        <div 
          className={`hidden md:flex absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ease-in-out z-20 flex-col items-center justify-center text-white px-12 text-center ${
            isLogin ? "translate-x-full" : "translate-x-0"
          }`}
          style={{
            backgroundImage: `url('https://images.stockcake.com/public/c/1/1/c111abab-9193-4526-bd6f-36c2338ec6e9/doctor-analyzing-data-stockcake.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay to keep the text perfectly clear over the photographic background */}
          <div className="absolute inset-0 bg-[#00A3E0]/80 mix-blend-multiply z-0"></div>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] z-0"></div>

          {/* Glowing accent orb */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl z-0"></div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl font-extrabold leading-tight">
              {isLogin ? "Join our health community" : "Welcome back, Researcher"}
            </h2>
            <div className="space-y-4 text-white/90">
              <p className="flex items-center gap-3 justify-center">
                <CheckCircle2 size={18} className="text-emerald-400" /> Streamlined Appointment Scheduling
              </p>
              <p className="flex items-center gap-3 justify-center">
                <CheckCircle2 size={18} className="text-emerald-400" /> Direct Doctor-Patient Messaging
              </p>
              <p className="flex items-center gap-3 justify-center">
                <CheckCircle2 size={18} className="text-emerald-400" /> Digital Prescriptions & Records
              </p>
            </div>
            <button 
              type="button"
              onClick={toggleAuthMode}
              className="mt-8 px-10 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-md rounded-full font-bold hover:bg-white hover:text-[#00A3E0] transition-all flex items-center gap-2 mx-auto"
            >
              {isLogin ? "SIGN UP NOW" : "SIGN IN TO ACCOUNT"} <ArrowRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}