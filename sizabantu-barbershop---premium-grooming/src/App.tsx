/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Mail, 
  Instagram, 
  MessageSquare,
  Star,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Send,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const TopNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: 'Services', href: '#pricing' },
    { name: 'Piercings', href: '#piercings' },
    { name: 'Gallery', href: '#portfolio' },
    { name: 'Reviews', href: '#reviews' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-md py-4 border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img 
            src="https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png" 
            alt="Sizabantu Barbershop" 
            className="h-10 md:h-12 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-brand-red transition-all"
            >
              {link.name}
            </a>
          ))}
          <motion.a 
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-red text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-100 transition-all"
          >
            Contact
          </motion.a>
        </div>

        {/* Mobile Header Elements */}
        <div className="flex md:hidden items-center gap-4">
          <motion.a 
            href="#contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-brand-red text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-100"
          >
            Contact
          </motion.a>
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 z-[120]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] p-8 flex flex-col pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-16">
                <img 
                  src="https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png" 
                  alt="Logo" 
                  className="h-10 object-contain"
                  referrerPolicy="no-referrer"
                />
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link, idx) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-black uppercase tracking-tighter flex justify-between items-center group py-2"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-6 h-6 text-brand-red opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 text-center md:text-left">Let's Connect</p>
                <div className="flex justify-center md:justify-start gap-8">
                  <a href="https://www.instagram.com/sizabantub/" className="group flex flex-col items-center gap-2">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-brand-red transition-all">
                      <Instagram className="w-6 h-6" />
                    </div>
                  </a>
                  <a href="https://wa.me/27607246829" className="group flex flex-col items-center gap-2">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-brand-blue transition-all">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center shadow-2xl shadow-slate-300 hover:bg-brand-red transition-all group overflow-hidden"
        >
          <img 
            src="https://res.cloudinary.com/dggitwduo/image/upload/v1775635697/SB_BARBER_LOGO_ASSET_ag52o1.png" 
            alt="Barber" 
            className="w-7 h-7 object-contain brightness-0 invert group-hover:rotate-12 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 opacity-60 group-hover:opacity-100 transition-opacity">Top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const LiveStatus = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isOpen = () => {
    const day = time.getDay(); // 0 = Sunday, 1 = Monday, ...
    const hour = time.getHours();
    
    if (day === 1) return false; // Monday Closed
    return hour >= 9 && hour < 18; // 09:00 - 18:00
  };

  return (
    <div className="absolute bottom-10 right-10 text-right">
      <div className="flex items-center justify-end gap-3 mb-1">
        <span className={`relative flex h-2 w-2 ${isOpen() ? 'text-emerald-500' : 'text-brand-red'}`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen() ? 'bg-emerald-400' : 'bg-brand-red/40'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen() ? 'bg-emerald-500' : 'bg-brand-red'}`}></span>
        </span>
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isOpen() ? 'text-emerald-500' : 'text-brand-red'}`}>
          {isOpen() ? 'Open Now' : 'Closed Now'}
        </p>
      </div>
      <p className="text-2xl font-black text-white tracking-tighter tabular-nums">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">
        {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative h-[80vh] md:h-[90vh] flex items-end bg-slate-900 overflow-hidden pb-20">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="https://cdn.coverr.co/videos/preview/720p/coverr-barber-cutting-hair-5426.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-slate-900/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <p className="text-white/60 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase max-w-xl">
            The pinnacle of grooming where tradition meets modern precision.
          </p>
        </motion.div>
      </div>

      {/* Live Status on the frame */}
      <div className="hidden md:block">
        <LiveStatus />
      </div>
    </section>
  );
};

const Mission = () => {
  return (
    <section className="py-24 bg-white text-slate-900 relative overflow-hidden border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Restored logo - Bigger, no transparency */}
        <div className="flex justify-center mb-16">
          <img 
            src="https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png" 
            alt="SB Logo" 
            className="h-28 md:h-40 object-contain drop-shadow-xl"
            referrerPolicy="no-referrer"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          <p className="text-3xl md:text-5xl font-light italic font-serif leading-relaxed text-slate-700 mb-16">
            "Our mission is to provide exceptional grooming experience by delivering superior service, building long lasting relationships and fostering a welcoming environment for people of all ages."
          </p>
          <div className="flex flex-col items-center">
            <div className="h-px w-24 bg-brand-red mb-6"></div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-blue">
              Thobane Nlhapo
            </p>
            <p className="text-[10px] font-light italic font-serif text-slate-400 uppercase tracking-[0.4em] mt-2">
              Founder
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const HaircutPricing = () => {
  const prices = [
    // HAIRSTYLES
    { name: "Fade", price: "R50", desc: "Precision blending", id: "01" },
    { name: "Brush", price: "R35", desc: "Classic brush cut", id: "02" },
    { name: "Chiskop", price: "R30", desc: "Clean bald cut", id: "03" },
    { name: "Razor Blade", price: "R60", desc: "Traditional razor finish", id: "04" },
    
    // OTHER
    { name: "Line Up", price: "R15", desc: "Edge definition", id: "05" },
    { name: "Beard Shave", price: "R15", desc: "Facial grooming", id: "06" },
    { name: "Custom Design", price: "R15", desc: "Artistic patterns", id: "07" },
    { name: "Wave Maintenance", price: "R30", desc: "Wave care", id: "08" },
    { name: "Waving", price: "R60", desc: "Professional waving", id: "09" },
    { name: "Wash - Long Hair", price: "R50", desc: "Deep cleansing", id: "10" },
    { name: "Eyebrow & Tint", price: "R50", desc: "Brow shaping", id: "11" },
    
    // COMBO PACKAGES
    { name: "Fade & Shave", price: "R60", desc: "Full cut & beard", id: "12" },
    { name: "Fade & Graphic", price: "R60", desc: "Cut & design", id: "13" },
    { name: "Fade & Wash", price: "R75", desc: "Cut & wash", id: "14" },
    { name: "Cut & Edge", price: "R75", desc: "Precision cut", id: "15" },
    { name: "Cut & Permanent", price: "R110", desc: "Style finish", id: "16" },
  ];

  return (
    <section id="pricing" className="bg-slate-50 text-slate-900 py-20 md:py-32 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Interactive Frame Banner */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="w-full h-40 md:h-80 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] mb-12 md:mb-20 group shadow-2xl shadow-slate-200"
        >
          <motion.div 
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000" 
              alt="Barbershop Background" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          </motion.div>
          
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-8 md:p-16 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full"
              >
                <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Service Menu</span>
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                  HAIR<span className="text-brand-blue italic font-serif lowercase tracking-normal">CUTS</span>
                </h2>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Minimized Haircut Offerings in 1 Balanced Frame */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-px flex-1 bg-slate-100"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Master Barber Menu</p>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                {prices.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-end border-b border-slate-50 pb-4 group/item cursor-default"
                  >
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight group-hover/item:text-brand-red transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-brand-red">{item.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Precision grooming for <span className="text-brand-blue italic font-serif lowercase tracking-normal">everyone</span>
                </p>
                <a 
                  href="https://wa.me/27607246829"
                  className="flex items-center gap-3 bg-brand-red text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-dark transition-all shadow-lg shadow-red-100"
                >
                  Enquire on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PiercingPricing = () => {
  const piercings = [
    { name: "Ear Piercing", price: "R50", desc: "Professional ear piercing", id: "01" },
    { name: "Nose Piercing", price: "R80+", desc: "Professional nose piercing", id: "02" },
    { name: "Snake Eyes", price: "R280", desc: "Specialty tongue piercing", id: "03" },
    { name: "Belly Piercing", price: "R250", desc: "Professional navel piercing", id: "04" },
    { name: "Smilly Piercing", price: "R280", desc: "Specialty lip piercing", id: "05" }
  ];

  return (
    <section id="piercings" className="bg-white text-slate-900 py-20 md:py-32 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Interactive Frame Banner */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="w-full h-40 md:h-80 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] mb-12 md:mb-20 group shadow-2xl shadow-blue-50"
        >
          <motion.div 
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=2000" 
              alt="Piercing Background" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-transparent to-transparent"></div>
          </motion.div>
 
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-8 md:p-16 text-center">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full"
              >
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                  Ethik <span className="text-brand-red italic font-serif lowercase tracking-normal">Piercings</span>
                </h2>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="hidden md:block text-right"
              >
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Contact Keith</p>
                 <p className="text-2xl font-bold text-white">078 868 4092</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Minimized Piercing Offerings in 1 Balanced Frame */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-px flex-1 bg-slate-200"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Official Price List</p>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                {piercings.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-end border-b border-slate-200 pb-4 group/item cursor-default"
                  >
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight group-hover/item:text-brand-blue transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-brand-blue">{item.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  In partnership with <span className="text-brand-red">Ethik Piercings</span>
                </p>
                <a 
                  href="https://wa.me/27788684092"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-brand-blue text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-dark transition-all shadow-lg shadow-blue-200"
                >
                  Chat With Keith
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const images = [
    { url: "https://res.cloudinary.com/dggitwduo/image/upload/v1776183249/WhatsApp_Image_2026-04-14_at_11.14.44_1_aqb6zl.jpg", title: "Sharp Fade", size: "large" },
    { url: "https://images.unsplash.com/photo-1599351431247-f10b21ce9630?auto=format&fit=crop&q=80&w=1000", title: "Beard Sculpt", size: "small" },
    { url: "https://res.cloudinary.com/dggitwduo/image/upload/v1776191196/WhatsApp_Image_2026-04-14_at_11.14.50_wdxnqw.jpg", title: "Classic Taper", size: "small" },
    { url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000", title: "Buzz Cut", size: "medium", isLogo: true },
    { url: "https://images.unsplash.com/photo-1621605815841-aa1291129994?auto=format&fit=crop&q=80&w=1000", title: "Clean Shave", size: "small" },
    { url: "https://images.unsplash.com/photo-1593702295094-1725842951cd?auto=format&fit=crop&q=80&w=1000", title: "Textured Crop", size: "small" },
  ];

  return (
    <section id="portfolio" className="py-32 bg-white text-slate-900 overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Our Work</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              The <br /> <span className="italic font-serif text-brand-blue lowercase tracking-normal">Gallery</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {images.map((img, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-[2rem] overflow-hidden group cursor-pointer border border-slate-100 shadow-sm
                ${img.size === 'large' ? 'col-span-2 row-span-2 h-[450px] md:h-[500px] lg:h-[600px]' : 'h-[220px] md:h-[240px] lg:h-[288px]'}
                ${img.size === 'medium' ? 'col-span-2' : ''}
              `}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Logo Overlay - Clean & Structured with Reddish Gradient */}
              {img.isLogo ? (
                <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-brand-red/40 via-brand-dark/20 to-brand-blue/20 backdrop-blur-[2px]">
                  <img 
                    src="https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png" 
                    alt="SB Logo" 
                    className="h-32 md:h-44 lg:h-56 w-auto object-contain brightness-0 invert drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                /* Text Overlay - Always visible but enhanced on hover */
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent flex items-end p-6 md:p-8 transition-all duration-500">
                  <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h4 className="text-sm md:text-xl font-bold uppercase tracking-tight text-white mb-1">{img.title}</h4>
                    <div className="h-1 w-0 group-hover:w-full bg-brand-red transition-all duration-500"></div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View Instagram Button */}
        <div className="mt-16 md:mt-24 flex justify-center">
          <motion.a 
            href="https://www.instagram.com/sizabantub/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-6 bg-slate-900 text-white px-8 md:px-16 py-6 md:py-10 rounded-3xl md:rounded-[2rem] group shadow-2xl shadow-slate-200 transition-all w-full max-w-sm md:max-w-xl lg:max-w-2xl"
          >
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-brand-red transition-colors truncate w-full">Follow Our Journey</span>
              <span className="text-xl md:text-4xl font-black uppercase tracking-tighter truncate w-full">View Instagram</span>
            </div>
            <div className="w-14 h-14 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-brand-red transition-all">
              <Instagram className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
};

const Reviews = () => {
  const reviews = [
    { name: "Thabo Mokoena", rating: 5, text: "Best fade in the city. Professional service and great atmosphere. Highly recommended!", date: "2 weeks ago" },
    { name: "Sarah Jenkins", rating: 5, text: "Brought my son here and they were so patient. The cut was perfect. We'll be back!", date: "1 month ago" },
    { name: "David Smith", rating: 5, text: "Premium experience from start to finish. The attention to detail is unmatched.", date: "3 days ago" },
    { name: "Lerato Cele", rating: 5, text: "Too fresh, too clean! Exactly what I asked for. Best barbershop in Klipfontein.", date: "1 week ago" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <section id="reviews" className="py-20 md:py-32 bg-white text-slate-900 relative overflow-hidden scroll-mt-20">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-20">
          <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-4 md:6 block">Testimonials</span>
          <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6 md:mb-8">
            The <span className="text-brand-blue italic font-serif lowercase tracking-normal">Word</span> <br /> On The Street
          </h2>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-brand-red text-brand-red" />
            ))}
            <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-brand-red ml-2">5.0 Overall Rating</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto relative h-[300px] md:h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 glass p-8 md:p-12 rounded-3xl md:rounded-[3rem] border border-slate-100 flex flex-col justify-center text-center group"
            >
              {/* Stars added here too */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-brand-red text-brand-red" />
                ))}
              </div>
              <p className="text-lg md:text-2xl font-light italic font-serif leading-relaxed text-slate-600 mb-8 md:mb-12 relative z-10">
                "{reviews[currentIndex].text}"
              </p>
              <div className="flex flex-col items-center gap-4 pt-6 md:pt-8 border-t border-slate-100">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-red rounded-full flex items-center justify-center text-white font-black text-xs md:text-sm">
                  {reviews[currentIndex].name.charAt(0)}
                </div>
                <div>
                  <p className="font-black uppercase tracking-tight text-xs md:text-sm text-slate-900">{reviews[currentIndex].name}</p>
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest">{reviews[currentIndex].date}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Carousel Indicators */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            {reviews.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-brand-red' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-24 text-center">
          <a 
            href="https://share.google/0S8TOcfrmPkNRfo0Z" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-blue transition-colors group"
          >
            <Star className="w-3 h-3" />
            View all Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact" className="py-32 bg-white text-slate-900 relative overflow-hidden scroll-mt-20">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/5 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Contact Us</span>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-16">
              Get <br /> <span className="text-brand-blue italic font-serif lowercase tracking-normal">In Touch</span>
            </h2>
            
            <div className="grid gap-12">
              <div className="flex items-start gap-6 group cursor-default">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Call Us</p>
                  <p className="text-2xl md:text-3xl font-black tracking-tight">+27 60 724 6829</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group cursor-default">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Visit Us</p>
                  <p className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                    Klipfontein view 644 <br /> Nancy Ndamase street
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group cursor-default">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</p>
                  <p className="text-2xl md:text-3xl font-black tracking-tight">info@sizabantu.co.za</p>
                </div>
              </div>
            </div>

            <div className="mt-20 flex gap-6">
              <a href="https://www.instagram.com/sizabantub/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-slate-100 flex items-center justify-center rounded-full text-slate-400 hover:bg-brand-red hover:text-white hover:border-brand-red transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/27607246829" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-slate-100 flex items-center justify-center rounded-full text-slate-400 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Fixed Google Map - Precise Location */}
            <div className="rounded-[3rem] overflow-hidden h-[450px] border border-slate-200 shadow-2xl relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3584.0531518388435!2d28.127814476081078!3d-26.01524317719602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e9513364f3d2f95%3A0x678663806f339b1a!2sSizabantu%20Barbershop!5e0!3m2!1sen!2sza!4v1713697200000!5m2!1sen!2sza" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Sizabantu Barbershop Location"
                className="grayscale hover:grayscale-0 transition-all duration-1000"
              ></iframe>
            </div>
            
            <div className="p-12 glass rounded-[3rem] border border-slate-200 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-10">Direct Message</h4>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue transition-all font-bold text-sm" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                    <input type="email" placeholder="john@example.com" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue transition-all font-bold text-sm" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</label>
                  <textarea placeholder="Tell us about your dream cut..." rows={4} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue transition-all resize-none font-bold text-sm"></textarea>
                </div>
                <button className="w-full bg-brand-red text-white hover:bg-brand-dark py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-4">
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-50 text-slate-900 pt-24 pb-12 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <img 
              src="https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png" 
              alt="Sizabantu Barbershop" 
              className="h-16 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <p className="text-slate-500 text-sm leading-relaxed">
              Established in 2022, Sizabantu Barbershop is dedicated to providing the ultimate grooming experience.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/sizabantub/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-brand-red transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/27607246829" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-brand-blue transition-all">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] mb-8">Quick Navigation</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#pricing" className="hover:text-brand-blue flex items-center gap-2 group transition-all"><ChevronRight className="w-3 h-3 text-brand-red opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /> Pricing</a></li>
              <li><a href="#portfolio" className="hover:text-brand-blue flex items-center gap-2 group transition-all"><ChevronRight className="w-3 h-3 text-brand-red opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /> Portfolio</a></li>
              <li><a href="#reviews" className="hover:text-brand-blue flex items-center gap-2 group transition-all"><ChevronRight className="w-3 h-3 text-brand-red opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /> Reviews</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] mb-8">Contact Information</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-brand-red" /> +27 60 724 6829</li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-brand-red" /> info@sizabantu.co.za</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-brand-red" /> Klipfontein View, Midrand</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] mb-8">Community</h4>
            <p className="text-slate-400 text-xs mb-6">Join our barber community for updates and tips.</p>
            <a 
              href="https://wa.me/27607246829" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-red text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-brand-dark transition-all flex items-center justify-between group shadow-xl shadow-red-50"
            >
              Join WhatsApp Community
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-slate-400 uppercase tracking-widest font-normal">
          <p className="text-center">&copy; 2026 Sizabantu Barbershop. Crafted for perfection.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-blue">Privacy</a>
            <a href="#" className="hover:text-brand-blue">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-blue selection:text-white">
      <TopNav />
      <main className="transition-all duration-500">
        <Hero />
        <Mission />
        <HaircutPricing />
        <PiercingPricing />
        <Portfolio />
        <Reviews />
        <ContactSection />
        <Footer />
      </main>
      <BackToTop />
    </div>
  );
}
