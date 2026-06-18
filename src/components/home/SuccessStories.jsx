'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaStar, FaUserCircle } from 'react-icons/fa';
import Image from 'next/image';

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  // Track broken image URLs cleanly without modifying DOM targets directly
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    // Simulating aggregation query from database reviews collection with user images
    setStories([
      { 
        id: 1, 
        patient: 'Elena Rostova', 
        text: 'Scheduling was completed within seconds. The neurological support node helped resolve my chronic sensory migraines accurately.', 
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
      },
      { 
        id: 2, 
        patient: 'Marcus Brody', 
        text: 'Highly intuitive workflow configurations. The cardiac dispatch response system helped monitoring metrics easily.', 
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
      },
    ]);
  }, []);

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="bg-slate-50 py-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-slate-800 tracking-tight">Patient Success Stories</h2>
          <p className="text-slate-400 text-sm mt-1">Real feedback aggregated cleanly from our digital reviews engine.</p>
        </div>

        {/* TESTIMONIALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story, idx) => {
            // Alternating calculations: Even index (0) from left (-60), Odd index (1) from right (60)
            const slideDirection = idx % 2 === 0 ? -60 : 60;

            return (
              <motion.div 
                key={story.id}
                initial={{ opacity: 0, x: slideDirection }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative"
              >
                {/* Decorative Quote Mark */}
                <div className="absolute top-6 right-6 text-[#00A3E0]/10 text-4xl">
                  <FaQuoteLeft />
                </div>

                {/* Review Content */}
                <div>
                  <div className="flex text-amber-400 text-xs gap-0.5 mb-3">
                    {[...Array(story.rating)].map((_, i) => <FaStar key={i} />)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{story.text}"
                  </p>
                </div>

                {/* Patient Profile Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-3">
                  {story.image && !imageErrors[story.id] ? (
                    <Image 
                      src={story.image} 
                      alt={story.patient} 
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                      onError={() => handleImageError(story.id)}
                      unoptimized // Bypasses next.config.js remotePatterns errors for remote testing links
                    />
                  ) : (
                    <div className="text-slate-300 text-3xl">
                      <FaUserCircle />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{story.patient}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Verified Patient</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}