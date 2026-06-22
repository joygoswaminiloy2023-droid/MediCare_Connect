'use client';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowRight } from 'lucide-react';

const faqs = [
  { q: "How do I book an appointment?", a: "Navigate to the Find Doctors section and click 'Book' on your preferred professional." },
  { q: "Is my medical data secure?", a: "Yes, we use industry-standard encryption to ensure your health records remain private." },
];

export default function ContactUsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-20">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black text-slate-900 tracking-tighter">Get In Touch</motion.h1>
        <p className="text-slate-500 font-medium">We are here to help you get the best medical care possible.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Left: Contact Details & Quick Links */}
        <div className="space-y-10">
          <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare size={20} /> Direct Support</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-medium opacity-80"><Mail size={18} /> support@medicare.com</div>
              <div className="flex items-center gap-4 text-sm font-medium opacity-80"><Phone size={18} /> +880 123 456 789</div>
              <div className="flex items-center gap-4 text-sm font-medium opacity-80"><MapPin size={18} /> Dhaka, Bangladesh</div>
            </div>
            <div className="pt-6 border-t border-slate-700 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#00A3E0]">
              <Clock size={14} /> Available 24/7 for Emergency Support
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 pb-4">
                <p className="font-bold text-slate-900 text-sm">{faq.q}</p>
                <p className="text-xs text-slate-500 mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contact Form */}
        <motion.form 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4"
        >
          <h2 className="text-xl font-black text-slate-900 mb-6">Send a Message</h2>
          <div className="grid grid-cols-2 gap-4">
            <input className="p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A3E0] outline-none transition-all text-sm" placeholder="First Name" />
            <input className="p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A3E0] outline-none transition-all text-sm" placeholder="Last Name" />
          </div>
          <input className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A3E0] outline-none transition-all text-sm" placeholder="Email Address" />
          <textarea className="w-full p-4 rounded-xl border border-slate-200 h-32 focus:ring-2 focus:ring-[#00A3E0] outline-none transition-all text-sm" placeholder="How can we help?"></textarea>
          
          <motion.button 
            whileHover={{ scale: 1.01 }} 
            className="w-full bg-[#00A3E0] text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            Send Message <ArrowRight size={14} />
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}