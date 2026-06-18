'use client'
import React, { useEffect, useState, useRef } from 'react';
import { FaUserMd, FaUserCheck, FaCalendarCheck, FaRegCommentDots } from 'react-icons/fa';

// --- ANIMATED COUNTER ENGINE (SCROLL-TRIGGERED) ---
function CountUp({ targetValue }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  // Intersection Observer to detect scroll entry
  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement || targetValue === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.unobserve(currentElement); // Stop observing once triggered
        }
      },
      { threshold: 0.1 } // Triggers when 10% of the element is visible
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, [targetValue]);

  // Counting logic running only after scroll activation
  useEffect(() => {
    if (!hasStarted || targetValue === 0) return;

    let start = 0;
    const duration = 1500; 
    const frameRate = 1000 / 60; 
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counterInterval = setInterval(() => {
      frame++;
      
      // Easing function: easeOutQuad
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

  if (targetValue === 0) return <span ref={elementRef}>...</span>;
  return <span ref={elementRef}>{count.toLocaleString()}+</span>;
}

// --- MAIN SECTION COMPONENT ---
export default function PlatformStats() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, reviews: 0 });

  useEffect(() => {
    // Simulating initial database payload sync
    const timer = setTimeout(() => {
      setStats({ doctors: 142, patients: 9840, appointments: 12450, reviews: 4890 });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const config = [
    { label: 'Verified Experts', value: stats.doctors, icon: FaUserMd },
    { label: 'Active Patients', value: stats.patients, icon: FaUserCheck },
    { label: 'Digital Intakes Completed', value: stats.appointments, icon: FaCalendarCheck },
    { label: 'Positive Testimonials', value: stats.reviews, icon: FaRegCommentDots },
  ];

  return (
    <section className="bg-slate-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {config.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center space-x-4 border-l border-slate-800 pl-4 lg:pl-6 first:border-0">
              <div className="text-2xl text-[#00A3E0]">
                <Icon />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  <CountUp targetValue={item.value} />
                </div>
                <div className="text-slate-400 text-xs font-medium tracking-wide">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}