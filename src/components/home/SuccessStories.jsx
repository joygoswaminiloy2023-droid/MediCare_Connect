'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaStar, FaUserCircle, FaSpinner } from 'react-icons/fa';

// Reviews only store `patientEmail`, not a display name — the backend tries
// to recover a real name from the linked appointment first; if that's not
// available either, we derive a readable label from the email's local part
// (e.g. "joygoswaminiloy2023@gmail.com" -> "Joygoswaminiloy2023") rather than
// showing a raw, full email address publicly on the homepage.
function getDisplayName(review) {
  if (review.patientName) return review.patientName;
  if (review.patientEmail) {
    const localPart = review.patientEmail.split('@')[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }
  return 'Verified Patient';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
        const res  = await fetch(`${BACKEND}/api/doctors/reviews/featured?limit=6&minRating=4`);
        const data = await res.json();
        if (data.success) {
          setStories(data.reviews || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load success stories:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Nothing genuine to show yet — quietly skip the section rather than
  // showing fabricated testimonials.
  if (!loading && !error && stories.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-slate-800 tracking-tight">Patient Success Stories</h2>
          <p className="text-slate-400 text-sm mt-1">Real feedback aggregated directly from our reviews collection.</p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex justify-center py-10">
            <FaSpinner className="animate-spin text-[#00A3E0] text-2xl" />
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <p className="text-center text-sm text-slate-400">Couldn't load reviews right now. Please check back soon.</p>
        )}

        {/* TESTIMONIALS GRID */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story, idx) => {
              const slideDirection = idx % 2 === 0 ? -60 : 60;
              const displayName    = getDisplayName(story);

              return (
                <motion.div
                  key={story._id}
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
                      "{story.reviewText}"
                    </p>
                    {story.doctorName && (
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        Reviewed Dr. {story.doctorName}
                        {story.specialization && <> &middot; {story.specialization}</>}
                      </p>
                    )}
                  </div>

                  {/* Patient Profile Footer */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-3">
                    <div className="text-slate-300 text-3xl">
                      <FaUserCircle />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{displayName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Verified Patient{story.createdAt && <> &middot; {formatDate(story.createdAt)}</>}
                      </span>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}