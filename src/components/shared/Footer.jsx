import React from 'react';
import { FaHeartbeat, FaFacebookF, FaTwitter, FaLinkedinIn, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { MdOutlineContactSupport } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 w-full">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-lg">
            <span className="text-[#00A3E0] text-xl">
              <FaHeartbeat />
            </span>
            <span className="tracking-tight uppercase">
              MediCare <span className="text-[#00A3E0]">Connect</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Digitizing healthcare workflows to reduce waiting intervals and maintain highly secure medical records.
          </p>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-4 border-l-2 border-[#00A3E0] pl-2">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="./" className="hover:text-[#00A3E0] transition-colors">Home</a></li>
            <li><a href="/find-doctors" className="hover:text-[#00A3E0] transition-colors">Find Doctors</a></li>
            <li><a href="/about-us" className="hover:text-[#00A3E0] transition-colors">About Us</a></li>
            <li><a href="/contact-us" className="hover:text-[#00A3E0] transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact Information Column */}
        <div>
          <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-4 border-l-2 border-[#00A3E0] pl-2">
            Contact Information
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-[#00A3E0]" />
              <span className="text-slate-300">office@medicareconnect.com</span>
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-[#00A3E0]" />
              <span className="text-slate-300">+1 (555) 019-2834</span>
            </li>
            
            {/* Styled Social Media Badges */}
            <li className="pt-3 flex space-x-3">
              <a href="#" className="w-8 h-8 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center hover:bg-[#00A3E0] hover:text-white transition-all">
                <FaFacebookF className="text-xs" />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center hover:bg-[#00A3E0] hover:text-white transition-all">
                <FaTwitter className="text-xs" />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center hover:bg-[#00A3E0] hover:text-white transition-all">
                <FaLinkedinIn className="text-xs" />
              </a>
            </li>
          </ul>
        </div>

        {/* Emergency Hotline Column (Matches design explicitly) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-center relative overflow-hidden group shadow-inner">
          <div className="absolute top-2 right-2 text-red-500/10 text-5xl font-bold group-hover:scale-110 transition-transform">
            <MdOutlineContactSupport />
          </div>
          <h4 className="text-red-400 font-extrabold tracking-wider uppercase text-[10px] mb-1 flex items-center gap-1.5">
            <span className="animate-pulse">⚠️</span> Emergency Hotline
          </h4>
          <p className="text-xl font-black text-red-500 tracking-tight transition-colors">
            (01) 98 765 432 10
          </p>
          <p className="text-[11px] text-slate-500 mt-1 leading-tight">
            Available 24/7 for immediate clinical dispatch configurations.
          </p>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} MediCare Connect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;