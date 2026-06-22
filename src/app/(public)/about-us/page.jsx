'use client';
import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, Stethoscope, Building2, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

// Component for the counting animation
function AnimatedCounter({ from, to }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(from, to, {
      duration: 2,
      onUpdate: (value) => setDisplay(Math.floor(value))
    });
    return () => controls.stop();
  }, [from, to]);
  return <>{display.toLocaleString()}</>;
}

export default function AboutUsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/analytics`);
        const data = await res.json();
        // Mapping the backend stats array directly
        setStats(data.stats || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-4">Our Impact</h1>
          <p className="text-slate-500 text-lg">Real-time data on the community we serve.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />
            ))
          ) : (
            stats.map((stat, i) => (
              <motion.div 
                key={stat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-[#00A3E0]/10 text-[#00A3E0] rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-1">
                  <AnimatedCounter from={0} to={parseInt(stat.value.toString().replace(/[^0-9]/g, '')) || 0} />
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.name}</p>
                <span className="text-emerald-500 text-[10px] font-bold mt-2 block">{stat.change} vs last month</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}