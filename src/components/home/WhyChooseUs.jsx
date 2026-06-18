'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaClock, FaStethoscope, FaArrowRight } from 'react-icons/fa';

export default function WhyChooseUs() {
  const advantages = [
    { 
      title: 'Highly Encrypted Records', 
      text: 'All patient file repositories and medical charts follow absolute medical encryption algorithms (AES-256) to ensure total confidentiality.', 
      icon: FaShieldAlt,
      accentColor: 'text-[#00A3E0]',
      bgColor: 'bg-[#e6f6fc]',
      shadowColor: 'hover:shadow-[#00A3E0]/10'
    },
    { 
      title: 'Zero Waiting Lines', 
      text: 'Advanced real-time scheduling automated nodes immediately map consultation workflows, letting you see a doctor in minutes.', 
      icon: FaClock,
      accentColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      shadowColor: 'hover:shadow-emerald-600/10'
    },
    { 
      title: 'Top 1% Physicians Only', 
      text: 'Strict automated and manual credential screening procedures verify background history parameters, licenses, and expertise thoroughly.', 
      icon: FaStethoscope,
      accentColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      shadowColor: 'hover:shadow-purple-600/10'
    },
  ];

  return (
    <section className="bg-slate-50 py-24 px-6 md:px-12 lg:px-20 overflow-hidden">
     <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-slate-800 tracking-tight">Why Choose Us</h2>
        </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start text-center md:text-left">
        
        {/* LEFT COLUMN: HERO MARKETING PANEL (Occupies 5 cols) */}
        {/* LEFT COLUMN: HERO MARKETING PANEL (Occupies 5 cols) */}
<motion.div 
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  className="lg:col-span-5 space-y-5 lg:sticky lg:top-24 flex flex-col items-center md:items-start text-center md:text-left"
>

 

  <div className="inline-block bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
    Next-Gen Care Ecosystem
  </div>
  
  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
    Our Standard <br />
    For <span className="text-[#00A3E0]">Modern Medicine</span>
  </h2>
  
  <p className="text-slate-500 text-base leading-relaxed max-w-md">
    We broke down traditional clinical roadblocks. Our system matches speed, institutional defense protocols, and doctor validation to offer a seamless patient experience.
  </p>
  
  <div className="pt-4 hidden lg:block">
    <a 
      href="/security-protocols" 
      className="inline-flex items-center gap-2 text-sm font-bold text-[#00A3E0] hover:text-[#0082b3] transition-colors group"
    >
      Explore our platform compliance infrastructure 
      <FaArrowRight className="text-sm transform group-hover:translate-x-1 transition-transform" />
    </a>
  </div>
</motion.div>

        {/* RIGHT COLUMN: STAGGERED ASYMMETRIC TIMELINE LIST (Occupies 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 50, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                whileHover={{ scale: 1.02, x: 10 }}
                className={`bg-white p-6 md:p-8 rounded-2xl border border-slate-200/70 shadow-sm transition-all duration-300 flex flex-col sm:flex-row items-start gap-6 group cursor-pointer ${item.shadowColor}`}
              >
                {/* Visual Accent Badge */}
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl transition-all duration-300 group-hover:rotate-6 ${item.bgColor} ${item.accentColor}`}>
                  <Icon />
                </div>
                
                {/* Context Text Elements */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 font-mono tracking-tight">
                      0{idx + 1}.
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight transition-colors group-hover:text-[#00A3E0]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}