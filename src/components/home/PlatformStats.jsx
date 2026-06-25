'use client'
import React, { useEffect, useState, useRef } from 'react';
import { FaUserMd, FaUserCheck, FaCalendarCheck, FaRegCommentDots } from 'react-icons/fa';

function CountUp({ targetValue }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.unobserve(currentElement);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentElement);
    return () => { if (currentElement) observer.unobserve(currentElement); };
  }, []);

  useEffect(() => {
    if (!hasStarted || targetValue <= 0) {
        setCount(targetValue);
        return;
    }
    const duration = 1500; 
    const frameRate = 1000 / 60; 
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counterInterval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.round(easeProgress * targetValue);
      
      if (frame >= totalFrames) {
        setCount(targetValue);
        clearInterval(counterInterval);
      } else {
        setCount(currentCount);
      }
    }, frameRate);
    return () => clearInterval(counterInterval);
  }, [hasStarted, targetValue]);

  return <span ref={elementRef}>{count.toLocaleString()}+</span>;
}

export default function PlatformStats() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, reviews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000'}/api/admin/analytics`);
        const data = await response.json();
        
        // Debug: Log the full response
        console.log('Analytics response:', data);
        
        // Extract stats from the stats array
        const extracted = {
          doctors: data.stats?.find(s => s.name === "TOTAL DOCTORS" || s.name === "Total Doctors")?.value || 0,
          patients: data.stats?.find(s => s.name === "TOTAL PATIENTS" || s.name === "Total Patients")?.value || 0,
          appointments: data.stats?.find(s => s.name === "TOTAL APPOINTMENTS" || s.name === "Total Appointments")?.value || 0,
          // FIX: Look for "REVIEWS RECEIVED" in stats array
          reviews: data.stats?.find(s => 
            s.name === "REVIEWS RECEIVED" || 
            s.name === "Total Reviews" || 
            s.name === "Reviews Received" ||
            s.name === "reviews"
          )?.value || 0
        };
        
        console.log('Extracted stats:', extracted);
        setStats(extracted);
        
      } catch (error) {
        console.error("Failed to sync analytics:", error);
        // Set fallback data
        setStats({
          doctors: 25,
          patients: 1,
          appointments: 5,
          reviews: 1
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const config = [
    { label: 'Total Doctors', value: stats.doctors, icon: FaUserMd },
    { label: 'Total Patients', value: stats.patients, icon: FaUserCheck },
    { label: 'Total Appointments', value: stats.appointments, icon: FaCalendarCheck },
    { label: 'Reviews Received', value: stats.reviews, icon: FaRegCommentDots },
  ];

  return (
    <section className="bg-slate-900 text-white py-12 px-6 rounded-3xl shadow-xl">
      {isLoading ? (
        <div className="flex justify-center text-slate-500 animate-pulse">Syncing system matrix...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {config.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-4 border-l border-slate-800 pl-6">
                <div className="text-3xl text-[#00A3E0] bg-slate-800 p-3 rounded-xl">
                  <Icon />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight">
                    <CountUp targetValue={item.value} />
                  </div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}