'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaRegCheckCircle } from 'react-icons/fa';
import hero from "../../../public/Hero.json";
import Lottie from 'lottie-react';

const Banner = () => {
    return (
        <div>
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden py-16 md:py-24 lg:py-32">
                {/* Subtle Background Graphic */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Fixed Layout Container for Perfect Screen Responsiveness */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    
                    {/* Animated Text Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start"
                    >
                        <div className="inline-flex items-center gap-2 bg-[#00A3E0]/10 border border-[#00A3E0]/30 rounded-full px-4 py-1.5 text-[#00A3E0] text-xs font-bold uppercase tracking-wider">
                            <FaRegCheckCircle /> Your Health, Our Priority
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight text-white max-w-2xl">
                            Your Premium Gateway to <span className="text-[#00A3E0]">Advanced Care</span>
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                            Connect instantly with top-tier verified medical specialists. Experience seamless clinical appointment bookings, securely integrated medical charts, and cloud workflows engineered to minimize waiting lines.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 w-full">
                            <a 
                                href="/find-doctors" 
                                className="bg-[#00A3E0] hover:bg-[#0082b3] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-[#00A3E0]/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <FaUserMd /> Find Best Doctors
                            </a>
                            <a 
                                href="/about-us" 
                                className="border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-200 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all text-center w-full sm:w-auto"
                            >
                                Learn More
                            </a>
                        </div>
                    </motion.div>

                    {/* Centered Lottie Animation Column */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-md lg:max-w-xl mx-auto flex items-center justify-center"
                    >
                        <div className="w-[75%] sm:w-[55%] lg:w-[85%] xl:w-[75%] z-10">
                            <Lottie animationData={hero} loop={true} />
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Banner;