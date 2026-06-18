import React from 'react';
import { FaHeartbeat, FaBrain, FaBone, FaBaby, FaHandSparkles } from 'react-icons/fa';

const specs = [
  { name: 'Cardiology', icon: FaHeartbeat, desc: 'Cardiovascular profiles & heart telemetry.' },
  { name: 'Neurology', icon: FaBrain, desc: 'Central nervous setups & cognitive indexing.' },
  { name: 'Orthopedics', icon: FaBone, desc: 'Bone density management & joint restoration.' },
  { name: 'Pediatrics', icon: FaBaby, desc: 'Comprehensive neonatal and child therapeutics.' },
  { name: 'Dermatology', icon: FaHandSparkles, desc: 'Advanced skincare diagnosis and diagnostics.' },
];

export default function Specializations() {
  return (
    <section className="bg-slate-50 py-16 px-6 border-b border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-slate-800 tracking-tight">Medical Specializations</h2>
          <p className="text-slate-400 text-sm mt-1">Select from our verified clinical departments to start your consultation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {specs.map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/60 hover:border-[#00A3E0] shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-[#e6f6fc] group-hover:bg-[#00A3E0] text-[#00A3E0] group-hover:text-white flex items-center justify-center text-xl transition-colors mb-4">
                  <Icon />
                </div>
                <h4 className="text-slate-800 font-bold text-sm tracking-tight mb-1 group-hover:text-[#00A3E0] transition-colors">{spec.name}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{spec.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
