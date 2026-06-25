'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { motion, animate } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Users, UserCheck2, Calendar, Star, Activity, BarChart3 
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000';

const CHART_COLORS = ['#00A3E0', '#34d399', '#f59e0b', '#818cf8', '#a855f7'];

function getStatIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('patient')) return Users;
  if (n.includes('doctor')) return UserCheck2;
  if (n.includes('appointment')) return Calendar;
  if (n.includes('review')) return Star;
  return Activity;
}

function AnimatedStatValue({ value }) {
  const raw = String(value ?? '0');
  const numericValue = parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0;
  const prefix = raw.match(/^[^0-9-]*/)?.[0] || '';
  const suffix = raw.match(/[^0-9]*$/)?.[0] || '';
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [numericValue]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' }
  })
};

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/analytics`);
      if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Fetch failure context execution on tab analytics:', error);
      toast.error('Failed to retrieve live logs for analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = analyticsData?.stats || [];

  // Replace "Total Revenue" with "Reviews Received" if it exists
  const processedStats = useMemo(() => {
    // Check if there's a revenue stat
    const revenueIndex = stats.findIndex(stat => 
      stat.name.toLowerCase().includes('revenue')
    );
    
    // If revenue exists, replace it with reviews
    if (revenueIndex !== -1) {
      const newStats = [...stats];
      newStats[revenueIndex] = {
        id: 4,
        name: 'Reviews Received',
        value: 89, // This would come from your backend
        change: '+15%',
        changeType: 'increase'
      };
      return newStats;
    }
    
    // If no revenue stat, check if reviews already exists
    const hasReviews = stats.some(stat => 
      stat.name.toLowerCase().includes('review')
    );
    
    if (!hasReviews) {
      // Add reviews if it doesn't exist
      return [
        ...stats,
        {
          id: stats.length + 1,
          name: 'Reviews Received',
          value: 89,
          change: '+15%',
          changeType: 'increase'
        }
      ];
    }
    
    return stats;
  }, [stats]);

  const volumeChartData = useMemo(
    () => processedStats.map((s) => ({
      name: s.name.replace(/total\s*/i, ''),
      value: parseFloat(String(s.value).replace(/[^0-9.-]/g, '')) || 0,
    })),
    [processedStats]
  );

  const growthChartData = useMemo(
    () => processedStats.map((s) => ({
      name: s.name.replace(/total\s*/i, ''),
      change: parseFloat(String(s.change).replace(/[^0-9.-]/g, '')) || 0,
    })),
    [processedStats]
  );

  const distributionData = useMemo(
    () => processedStats
      .filter((s) => !s.name.toLowerCase().includes('revenue'))
      .map((s) => ({
        name: s.name.replace(/total\s*/i, ''),
        value: parseFloat(String(s.value).replace(/[^0-9.-]/g, '')) || 0,
      })),
    [processedStats]
  );

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#00A3E0] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Matrix Core Engine...</span>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="relative space-y-10">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 bg-[#00A3E0]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Performance Analytics</h1>
        <p className="text-xs text-slate-500 font-medium">Real-time breakdown of platform health parameters.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {processedStats.map((stat, i) => {
          const Icon = getStatIcon(stat.name);
          const changeNum = parseFloat(String(stat.change).replace(/[^0-9.-]/g, '')) || 0;
          const isPositive = changeNum >= 0;
          return (
            <motion.div
              key={stat.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -6, scale: 1.02 }}
              className="group bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#00A3E0]/30 transition-shadow flex flex-col justify-between cursor-default"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="w-8 h-8 rounded-lg bg-[#00A3E0]/10 text-[#00A3E0] flex items-center justify-center"
                >
                  <Icon size={16} />
                </motion.div>
              </div>
              <div className="flex items-end justify-between mt-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  <AnimatedStatValue value={stat.value} />
                </h2>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {stat.change}
                </span>
              </div>
              <div className="h-0.5 w-0 group-hover:w-full bg-[#00A3E0] transition-all duration-500 mt-4 rounded-full" />
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Platform Volume</h3>
              <p className="text-[11px] text-slate-400 font-medium">Current totals across core entities</p>
            </div>
            <BarChart3 size={16} className="text-[#00A3E0]" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={volumeChartData} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12, fontWeight: 600 }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {volumeChartData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
        >
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Distribution</h3>
            <p className="text-[11px] text-slate-400 font-medium">Share of patients, doctors & appointments</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                cornerRadius={6}
              >
                {distributionData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {distributionData.map((d, idx) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Growth chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Growth Momentum</h3>
            <p className="text-[11px] text-slate-400 font-medium">Percentage change across metrics</p>
          </div>
          <TrendingUp size={16} className="text-emerald-500" />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={growthChartData} layout="vertical" barCategoryGap="32%">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12, fontWeight: 600 }}
              formatter={(v) => [`${v}%`, 'Change']}
            />
            <Bar dataKey="change" radius={[0, 8, 8, 0]}>
              {growthChartData.map((d, idx) => (
                <Cell key={idx} fill={d.change >= 0 ? '#34d399' : '#fb7185'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}