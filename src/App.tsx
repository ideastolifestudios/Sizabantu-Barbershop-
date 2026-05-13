/**
 * Sizabantu Barbershop - Final Consolidated UI
 */

import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { 
  Phone, MapPin, Mail, Instagram, MessageSquare, Star, Menu, X, ArrowRight, ChevronRight,
  Send, User, Calendar, Clock, Trophy, Users, LogOut, Scissors, CheckCircle2, AlertCircle,
  Zap, Trash2, Bell, Camera, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut,
  User as FirebaseUser, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, 
  onSnapshot, addDoc, serverTimestamp, orderBy, limit, deleteDoc, Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { io } from 'socket.io-client';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const socket = io();

// --- Constants ---
const SERVICES = [
  { id: 'fade', name: 'Fade', price: 50, desc: 'Precision blending', time: '30m' },
  { id: 'brush', name: 'Brush', price: 35, desc: 'Classic brush cut', time: '20m' },
  { id: 'chiskop', name: 'Chiskop', price: 30, desc: 'Clean bald cut', time: '15m' },
  { id: 'razor', name: 'Razor Blade', price: 60, desc: 'Traditional razor finish', time: '30m' },
  { id: 'lineup', name: 'Line Up', price: 15, desc: 'Edge definition', time: '10m' },
  { id: 'beard', name: 'Beard Shave', price: 15, desc: 'Facial grooming', time: '15m' },
  { id: 'design', name: 'Custom Design', price: 15, desc: 'Artistic patterns', time: '15m' },
  { id: 'waves-m', name: 'Wave Maintenance', price: 30, desc: 'Wave care', time: '20m' },
  { id: 'waving', name: 'Waving', price: 60, desc: 'Professional waving', time: '45m' },
  { id: 'wash', name: 'Wash - Long Hair', price: 50, desc: 'Deep cleansing', time: '20m' },
  { id: 'eyebrow', name: 'Eyebrow & Tint', price: 50, desc: 'Brow shaping', time: '20m' },
  { id: 'combo1', name: 'Fade & Shave', price: 60, desc: 'Full cut & beard', time: '45m' },
  { id: 'combo2', name: 'Fade & Graphic', price: 60, desc: 'Cut & design', time: '45m' },
  { id: 'combo3', name: 'Fade & Wash', price: 75, desc: 'Cut & wash', time: '50m' },
  { id: 'combo4', name: 'Cut & Edge', price: 75, desc: 'Precision cut', time: '45m' },
  { id: 'combo5', name: 'Cut & Permanent', price: 110, desc: 'Style finish', time: '60m' },
];

// --- Hooks ---
const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authStep, setAuthStep] = useState<'methods' | 'email' | 'otp'>('methods');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          const newProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || email.split('@')[0],
            email: firebaseUser.email || email,
            stamps: 0,
            role: (firebaseUser.email?.endsWith('@sizabantubarbershop.co.za') || firebaseUser.email === 'cbrprints22@gmail.com') ? 'admin' : 'client',
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        } else {
          setProfile(userDoc.data());
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [email]);

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingCode(true);
    try {
      // CLEANUP: Points to the new consolidated POST route
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'request' }) 
      });
      if (response.ok) setAuthStep('otp');
    } catch (err) { console.error(err); } finally { setIsSendingCode(false); }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // CLEANUP: Points to the new consolidated POST route
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, action: 'verify' })
      });
      const data = await response.json();
      if (data.success && data.data.customToken) {
        await signInWithCustomToken(auth, data.data.customToken);
        setAuthStep('methods');
      }
    } catch (err) { console.error(err); }
  };

  const loginGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (err) { console.error(err); }
  };

  const logout = () => signOut(auth);

  return { user, profile, loading, logout, authStep, setAuthStep, email, setEmail, otp, setOtp, isSendingCode, requestOTP, verifyOTP, loginGoogle };
};

// --- Components ---

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    socket.on('notification:direct', (data) => {
      if (profile && data.userId === profile.uid) {
        const newNotif = { id: Date.now(), message: data.message, icon: <Bell className="w-5 h-5 text-red-500" /> };
        setNotifications(prev => [newNotif, ...prev]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 8000);
      }
    });
    return () => { socket.off('notification:direct'); };
  }, [profile]);

  return (
    <div className="fixed top-24 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div key={notif.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl p-4 rounded-2xl flex items-center gap-4 min-w-[300px] pointer-events-auto">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">{notif.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">System Message</p>
              <p className="text-sm font-bold text-slate-900">{notif.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('status', 'in', ['confirmed', 'checked-in', 'started']), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'bookings', id), { status, updatedAt: serverTimestamp() });
  };

  const sendPing = async (userId: string, message: string) => {
    // CLEANUP: Points to new consolidated notification route
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, event: 'direct', templateData: { message } })
    });
  };

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-black uppercase mb-8">Admin <span className="text-blue-600">Hub</span></h2>
        <div className="grid gap-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-blue-600">{b.userName?.charAt(0)}</div>
                <div>
                  <p className="font-black uppercase">{b.userName}</p>
                  <p className="text-[10px] text-slate-400">{b.serviceName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => sendPing(b.userId, "Your turn is next!")} className="p-3 bg-white rounded-xl text-slate-400"><Bell className="w-4 h-4" /></button>
                {b.status === 'confirmed' && <button onClick={() => updateStatus(b.id, 'started')} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase">Start</button>}
                {b.status === 'started' && <button onClick={() => updateStatus(b.id, 'completed')} className="px-6 py-2 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase">Finish</button>}
                <button onClick={() => deleteDoc(doc(db, 'bookings', b.id))} className="p-3 bg-red-50 text-red-600 rounded-xl"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BookingSystem = ({ profile }: { profile: any }) => {
  const { authStep, setAuthStep, email, setEmail, otp, setOtp, isSendingCode, requestOTP, verifyOTP, loginGoogle } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'bookings'), where('userId', '==', profile.uid), where('status', 'in', ['confirmed', 'started']), limit(1));
    return onSnapshot(q, (snap) => {
      if (!snap.empty) setActiveBooking({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else setActiveBooking(null);
    });
  }, [profile]);

  const confirmBooking = async (type: 'queue' | 'scheduled') => {
    if (!profile) return setShowLoginModal(true);
    const service = SERVICES.find(s => s.id === selectedService);
    // CLEANUP: Matches the backend POST /api/bookings structure
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: profile.displayName,
        userPhone: profile.phoneNumber || 'N/A',
        serviceId: selectedService,
        serviceName: service?.name,
        servicePrice: service?.price,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type
      })
    });
    if (response.ok) setSelectedService('');
  };

  return (
    <section id="book" className="py-24 bg-slate-900 text-white relative scroll-mt-20">
      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-slate-900 text-center relative">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 text-slate-300"><X /></button>
              <h3 className="text-2xl font-black uppercase mb-8">Sign In</h3>
              {authStep === 'methods' && (
                <div className="space-y-3">
                  <button onClick={() => setAuthStep('email')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase">Email Login</button>
                  <button onClick={loginGoogle} className="w-full bg-slate-50 border py-4 rounded-2xl font-black text-[10px] uppercase">Google Login</button>
                </div>
              )}
              {authStep === 'email' && (
                <form onSubmit={requestOTP} className="space-y-4">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border p-4 rounded-2xl" />
                  <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">{isSendingCode ? 'Sending...' : 'Send Code'}</button>
                </form>
              )}
              {authStep === 'otp' && (
                <form onSubmit={verifyOTP} className="space-y-4">
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" className="w-full border p-4 rounded-2xl text-center text-2xl font-black" />
                  <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Verify</button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6">
        {!activeBooking ? (
          <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-red-600 p-12 rounded-[3.5rem]">
               <h3 className="text-4xl font-black uppercase mb-4">Walk-In</h3>
               <div className="space-y-3 mb-8">
                 {SERVICES.slice(0, 5).map(s => (
                   <button key={s.id} onClick={() => setSelectedService(s.id)} className={`w-full p-4 rounded-2xl border flex justify-between ${selectedService === s.id ? 'bg-white text-red-600' : 'border-white/20'}`}>
                     <span className="font-bold">{s.name}</span>
                     <span>R{s.price}</span>
                   </button>
                 ))}
               </div>
               <button onClick={() => confirmBooking('queue')} disabled={!selectedService} className="w-full bg-white text-red-600 py-6 rounded-2xl font-black uppercase">Join Queue</button>
             </div>
             <div className="bg-white/5 border border-white/10 p-12 rounded-[3.5rem]">
               <h3 className="text-4xl font-black uppercase mb-4">Scheduled</h3>
               <p className="text-white/40 mb-8 font-serif italic">Priority booking coming soon to this interface.</p>
             </div>
          </div>
        ) : (
          <div className="bg-white/10 p-12 rounded-[3.5rem] border border-white/10 text-center">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black uppercase">Session Active</h3>
            <p className="text-white/40 mt-2">{activeBooking.serviceName} • {activeBooking.status}</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- Main Layout ---
const TopNav = () => {
  const { profile, logout } = useAuth();
  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-md py-4 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <img src="https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png" alt="Logo" className="h-10" />
        <div className="flex items-center gap-6">
          {profile?.role === 'admin' && <span className="text-[10px] font-black uppercase text-blue-600 animate-pulse">Admin Mode</span>}
          {profile ? (
            <button onClick={logout} className="text-[10px] font-black uppercase text-red-600 flex items-center gap-2"><LogOut className="w-3 h-3" /> Logout</button>
          ) : (
            <button onClick={() => document.getElementById('book')?.scrollIntoView()} className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-2"><User className="w-3 h-3" /> Login</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  const { profile } = useAuth();
  return (
    <div className="min-h-screen bg-white font-sans">
      <NotificationCenter />
      <TopNav />
      <main>
        <section className="h-screen bg-slate-900 flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter">Legacy <br/><span className="text-blue-500 italic font-serif lowercase">Grooming</span></h1>
            <p className="text-white/40 mt-8 font-serif italic text-lg">Midrand's Premier Barbershop Experience</p>
          </div>
        </section>
        {profile?.role === 'admin' && <AdminDashboard />}
        <BookingSystem profile={profile} />
        {/* Placeholder sections to maintain scroll links */}
        <section id="pricing" className="py-24 bg-slate-50 text-center uppercase font-black text-slate-200 text-4xl">Services Menu</section>
        <section id="portfolio" className="py-24 bg-white text-center uppercase font-black text-slate-100 text-4xl">Gallery</section>
      </main>
    </div>
  );
}