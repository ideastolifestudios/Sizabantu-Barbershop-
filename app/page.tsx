'use client';

'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
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
  ExternalLink,
  User,
  Calendar,
  Clock,
  Trophy,
  Users,
  LogOut,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Zap,
  Settings,
  Trash2,
  RefreshCcw,
  Bell,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { io } from 'socket.io-client';


// Inline Instagram icon (removed from lucide-react v0.400+)
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

// Prevent Next.js from SSR-rendering this heavy client page (Firebase + socket.io)
export const dynamic = 'force-dynamic';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const socket = io();

// Validate Connection to Firestore (As per instructions)
async function testConnection() {
  try {
    const { doc, getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('permission-denied'))) {
      console.warn("Firebase connection notice:", error.message);
    }
  }
}
testConnection();

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

// --- Context / Hooks ---

const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId?: string | null;
      email?: string | null;
      emailVerified?: boolean | null;
    }
  }

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // throw new Error(JSON.stringify(errInfo)); // Silent in console but logged
  };

  const [authStep, setAuthStep] = useState<'methods' | 'email' | 'otp'>('methods');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailStr) return "Email is required";
    if (!re.test(emailStr)) return "Please enter a valid email address";
    return "";
  };

  const validateOTP = (otpStr: string) => {
    if (!otpStr) return "Access code is required";
    if (otpStr.length !== 6) return "Code must be 6 digits";
    return "";
  };

  useEffect(() => {
    if (email) setEmailError(validateEmail(email));
    else setEmailError('');
  }, [email]);

  useEffect(() => {
    if (otp) setOtpError(validateOTP(otp));
    else setOtpError('');
  }, [otp]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const newProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || email.split('@')[0],
              email: firebaseUser.email || email,
              phoneNumber: firebaseUser.phoneNumber,
              photoURL: firebaseUser.photoURL,
              stamps: 0,
              rewardsUnlocked: [],
              role: ((firebaseUser.email || email) === 'cbrprints22@gmail.com' || ((firebaseUser.email || email) && (firebaseUser.email || email).endsWith('@sizabantubarbershop.co.za'))) ? 'admin' : 'client',
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            const existingProfile = userDoc.data();
            if (((firebaseUser.email || email) === 'cbrprints22@gmail.com' || ((firebaseUser.email || email) && (firebaseUser.email || email).endsWith('@sizabantubarbershop.co.za'))) && existingProfile?.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin' });
              setProfile({ ...existingProfile, role: 'admin' });
            } else {
              setProfile(existingProfile);
            }
            onSnapshot(userRef, (doc) => {
              if (doc.exists()) {
                setProfile(doc.data());
              }
            }, (error) => handleFirestoreError(error, 'get' as any, `users/${firebaseUser.uid}`));
          }
        } catch (err) {
          console.error("Auth profile error:", err);
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
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setIsSendingCode(true);
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setAuthStep('otp');
      } else {
        alert("Failed to send code. Try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateOTP(otp);
    if (error) {
      setOtpError(error);
      return;
    }
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (response.ok && data.customToken) {
        const { signInWithCustomToken } = await import('firebase/auth');
        await signInWithCustomToken(auth, data.customToken);
        setAuthStep('methods');
      } else {
        alert("Invalid or expired code.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loginGoogle = async () => {
     try {
       // Using Popup, but handling common browser blocks
       await signInWithPopup(auth, googleProvider);
     } catch (err: any) {
       if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
         alert("Please enable popups or try again. If you're in an iframe, open the app in a new tab for the best experience.");
       }
       console.error("Login Error:", err);
     }
  };
  const logout = () => signOut(auth);

  return { 
    user, 
    profile, 
    loading, 
    logout,
    authStep, 
    setAuthStep, 
    email, 
    setEmail, 
    otp, 
    setOtp, 
    otpError,
    isSendingCode, 
    requestOTP, 
    verifyOTP, 
    loginGoogle,
    handleFirestoreError,
    OperationType,
    emailError
  };
};

// --- Notifications ---

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    socket.on('notification:reward', (data) => {
      const newNotif = { 
        id: Date.now(), 
        type: 'reward', 
        message: `Congrats! You have ${data.stamps} stamps now.`,
        icon: <Trophy className="w-5 h-5 text-yellow-500" />
      };
      setNotifications(prev => [newNotif, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 5000);
    });

    socket.on('queue:updated', (data) => {
      const newNotif = { 
        id: Date.now(), 
        type: 'queue', 
        message: `Queue updated: Slot ${data.bookingId} is now ${data.status}.`,
        icon: <Users className="w-5 h-5 text-blue-500" />
      };
      setNotifications(prev => [newNotif, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 5000);
    });

    socket.on('notification:direct', (data) => {
      // Only show if it's for this user
      if (profile && data.userId === profile.uid) {
        const newNotif = { 
          id: Date.now(), 
          type: 'direct', 
          message: data.message,
          icon: <Bell className="w-5 h-5 text-brand-red animate-bounce" />
        };
        setNotifications(prev => [newNotif, ...prev]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 8000);
      }
    });

    socket.on('notification:admin', (data) => {
      if (profile?.role === 'admin') {
        const newNotif = { 
          id: Date.now(), 
          type: 'admin', 
          message: `${data.title}: ${data.message}`,
          icon: <ShieldCheck className="w-5 h-5 text-brand-blue" />
        };
        setNotifications(prev => [newNotif, ...prev]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 8000);
      }
    });

    return () => {
      socket.off('notification:reward');
      socket.off('queue:updated');
      socket.off('notification:direct');
    };
  }, []);

  return (
    <div className="fixed top-24 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl p-4 rounded-2xl flex items-center gap-4 min-w-[300px] pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              {notif.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Automated System</p>
              <p className="text-sm font-bold text-slate-900">{notif.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Automation System Components ---

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-12 text-center bg-slate-50/50 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200/20">
          <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-brand-red" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">Something went wrong</h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto text-sm font-serif italic">We encountered an error loading this module. Our team has been notified. Please try refreshing.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand-red text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[9px] shadow-xl shadow-red-500/20"
          >
            Refresh Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'scheduled'>('queue');
  const [bookings, setBookings] = useState<any[]>([]);
  const { handleFirestoreError } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      where('status', 'in', ['pending', 'confirmed', 'checked-in', 'in-progress']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'list' as any, 'bookings'));

    return unsubscribe;
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'bookings', id), { status, updatedAt: serverTimestamp() });
  };

  const sendPing = async (userId: string, message: string) => {
    await fetch(`/api/notify/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
  };

  const cancelBooking = async (id: string) => {
    await deleteDoc(doc(db, 'bookings', id));
  };

  const filteredBookings = bookings.filter(b => b.type === activeTab);

  return (
    <section className="py-24 bg-white text-slate-900 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-md">
            <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Command Center</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Barber <span className="text-brand-blue italic font-serif lowercase tracking-normal">Hub</span></h2>
            <p className="text-slate-400 text-sm leading-relaxed">Queue control and session management. No-shows are auto-expired after 10 minutes by the system engine.</p>
          </div>

          <div className="w-full lg:w-auto space-y-4">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Queue Management</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-brand-blue animate-pulse">Monitoring Live Sessions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 w-fit mb-8">
          <button onClick={() => setActiveTab('queue')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'queue' ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400'}`}>Live Queue</button>
          <button onClick={() => setActiveTab('scheduled')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'scheduled' ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400'}`}>Scheduled</button>
        </div>

        <div className="grid gap-4">
          {filteredBookings.length > 0 ? filteredBookings.map((b) => (
            <motion.div layout key={b.id} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden group">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-brand-blue border border-slate-100 text-xl">
                  {b.userName?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tight text-xl">{b.userName}</h4>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{b.serviceName} • {b.type === 'scheduled' ? b.scheduledAt?.toDate?.()?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Queue'}</p>
                </div>
              </div>              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border ${
                    b.status === 'checked-in' ? 'bg-blue-50 border-blue-100 text-blue-500' :
                    b.status === 'in-progress' ? 'bg-yellow-50 border-yellow-100 text-yellow-500' :
                    'bg-slate-50 border-transparent text-slate-400'
                  }`}>
                    {b.status.replace('-', ' ')}
                  </div>
  
                  <div className="flex gap-2">
                    <button onClick={() => sendPing(b.userId, "Please prepare, your session is coming up soon.")} title="Ping Client" className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-blue hover:text-white transition-all"><Bell className="w-3.5 h-3.5" /></button>
                    {b.status === 'confirmed' && (
                      <button onClick={() => updateStatus(b.id, 'started')} className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-black uppercase text-[9px] hover:bg-slate-900 transition-all">
                        <Scissors className="w-3.5 h-3.5" />
                        Start
                      </button>
                    )}
                    {b.status === 'started' && (
                      <button onClick={() => updateStatus(b.id, 'completed')} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-black uppercase text-[9px] hover:bg-green-600 transition-all">
                        <Trophy className="w-3.5 h-3.5" />
                        Finish
                      </button>
                    )}
                    <button onClick={() => updateStatus(b.id, 'missed')} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
            </motion.div>
          )) : (
            <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <AlertCircle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">No sessions today</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const BookingSystem = ({ profile }: { profile: any }) => {
  const { loginGoogle } = useAuth();

  // Step flow: 0=idle 1=service 2=party 3=type 4=datetime(sched only) 5=details 6=confirmed
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [bookingType, setBookingType] = useState<'queue' | 'scheduled' | ''>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMethod, setAuthMethod] = useState<'idle'|'google'>('idle');

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', profile.uid),
      where('status', 'in', ['pending', 'confirmed', 'checked-in', 'in-progress']),
      limit(1)
    );
    return onSnapshot(q, (snap) => {
      setActiveBooking(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    });
  }, [profile]);

  useEffect(() => {
    if (profile?.displayName && !clientName) setClientName(profile.displayName);
  }, [profile]);

  const service = SERVICES.find(s => s.id === selectedService);
  const totalPrice = (service?.price || 0) * partySize;

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() === 1) return null; // Monday closed
    return {
      full: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday: i === 0
    };
  }).filter(Boolean) as { full: string; label: string; isToday: boolean }[];

  const timeSlots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];

  const startBooking = () => {
    if (!profile) { setShowAuth(true); return; }
    setStep(1);
  };

  const submitBooking = async () => {
    if (!profile || !selectedService || !clientName || !clientPhone) return;
    setLoading(true);
    try {
      let scheduledAt: any = serverTimestamp();
      if (bookingType === 'scheduled' && selectedDate && selectedTime) {
        const d = new Date(selectedDate);
        const [h, m] = selectedTime.split(':');
        d.setHours(+h, +m, 0, 0);
        scheduledAt = Timestamp.fromDate(d);
      }
      const bookingData = {
        userId: profile.uid,
        userName: clientName,
        userPhone: clientPhone,
        userEmail: profile.email || '',
        type: bookingType,
        partySize,
        serviceId: selectedService,
        serviceName: service?.name || 'Custom Cut',
        totalPaid: totalPrice,
        status: 'confirmed',
        location: 'shop',
        scheduledAt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      setConfirmed({ id: docRef.id, ...bookingData, scheduledDate: selectedDate, scheduledTime: selectedTime });
      setStep(6);
    } catch (err) { console.error('Booking error:', err); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setStep(0); setSelectedService(''); setPartySize(1); setBookingType('');
    setSelectedDate(''); setSelectedTime(''); setConfirmed(null);
    if (profile?.displayName) setClientName(profile.displayName);
    else setClientName('');
    setClientPhone('');
  };

  // Shared input styles
  const selectCls = "w-full border border-slate-200 bg-white text-slate-900 px-4 py-3 rounded text-sm focus:outline-none focus:border-slate-900 transition-colors";
  const labelCls = "block text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5";
  const btnPrimary = "w-full bg-slate-900 text-white py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-slate-700 disabled:opacity-40";
  const btnSecondary = "w-full border border-slate-200 text-slate-700 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:border-slate-900 hover:text-slate-900";

  // Progress bar steps
  const totalSteps = bookingType === 'scheduled' ? 5 : 4;
  const currentProgress = step > 0 ? Math.min(step, totalSteps) : 0;

  return (
    <section id="book" className="py-20 bg-slate-900 scroll-mt-20">
      <div className="max-w-2xl mx-auto px-6">

        {/* Auth Gate Modal */}
        <AnimatePresence>
          {showAuth && !profile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] bg-slate-900/95 flex items-center justify-center p-6">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-sm bg-white p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest">Sign In to Book</h3>
                  <button onClick={() => setShowAuth(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Sign in to book your session, track appointments, and earn loyalty stamps.
                </p>
                <button
                  onClick={async () => {
                    setAuthMethod('google');
                    await loginGoogle();
                    setAuthMethod('idle');
                    if (auth.currentUser) { setShowAuth(false); setStep(1); }
                  }}
                  disabled={authMethod === 'google'}
                  className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:border-slate-900 transition-colors disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="" />
                  {authMethod === 'google' ? 'Signing in...' : 'Continue with Google'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">Sizabantu Barbershop</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">Book a Session</h2>
        </div>

        {/* Active Booking Banner */}
        {activeBooking && step === 0 && (
          <div className="border border-slate-700 p-5 mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Active Booking</p>
            <p className="text-sm font-semibold text-white">{activeBooking.serviceName}</p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{activeBooking.status}</p>
          </div>
        )}

        {/* Step 0: Entry */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Open Tue – Sun · 09:00 – 18:00 · Klipfontein View, Midrand
            </p>
            <button onClick={startBooking} className={btnPrimary}>
              {profile ? 'Start Booking' : 'Sign In & Book'}
            </button>
            {profile && (
              <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest">
                Signed in as {profile.displayName?.split(' ')[0]}
              </p>
            )}
          </div>
        )}

        {/* Steps 1-5: Booking Flow */}
        {step >= 1 && step <= 5 && (
          <div>
            {/* Progress */}
            <div className="flex items-center gap-1 mb-8">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className={`h-0.5 flex-1 transition-colors ${i < currentProgress ? 'bg-white' : 'bg-slate-700'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Service */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Step 1 of {totalSteps}</p>
                    <h3 className="text-lg font-semibold text-white mb-5">Select a service</h3>
                    <label className={labelCls + " text-slate-400"}>Service</label>
                    <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className={selectCls}>
                      <option value="">Choose service...</option>
                      {SERVICES.map(s => (
                        <option key={s.id} value={s.id}>{s.name} — R{s.price}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => selectedService && setStep(2)} disabled={!selectedService} className={btnPrimary}>
                    Next
                  </button>
                </motion.div>
              )}

              {/* Step 2: Party Size */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Step 2 of {totalSteps}</p>
                    <h3 className="text-lg font-semibold text-white mb-5">How many people?</h3>
                    <label className={labelCls + " text-slate-400"}>Number of people</label>
                    <select value={partySize} onChange={e => setPartySize(+e.target.value)} className={selectCls}>
                      <option value={1}>1 person</option>
                      <option value={2}>2 people</option>
                      <option value={3}>3 people</option>
                      <option value={4}>4 people</option>
                    </select>
                    {partySize > 1 && (
                      <p className="text-xs text-slate-400 mt-2">
                        Each person gets their own appointment slot. Total: R{totalPrice}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className={btnSecondary + " text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"}>Back</button>
                    <button onClick={() => setStep(3)} className={btnPrimary}>Next</button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Queue or Scheduled */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Step 3 of {totalSteps}</p>
                    <h3 className="text-lg font-semibold text-white mb-5">When would you like to come in?</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setBookingType('queue'); setStep(bookingType === 'scheduled' ? 4 : 4); }}
                        className={`w-full p-4 border text-left transition-colors ${bookingType === 'queue' ? 'border-white bg-white/5' : 'border-slate-700 hover:border-slate-500'}`}
                        onClickCapture={() => setBookingType('queue')}
                        onClick={() => { setBookingType('queue'); setStep(4); }}
                      >
                        <p className="text-sm font-semibold text-white">Walk-in Queue</p>
                        <p className="text-xs text-slate-400 mt-0.5">Join today's queue. We'll hold your spot.</p>
                      </button>
                      <button
                        className={`w-full p-4 border text-left transition-colors ${bookingType === 'scheduled' ? 'border-white bg-white/5' : 'border-slate-700 hover:border-slate-500'}`}
                        onClick={() => { setBookingType('scheduled'); setStep(4); }}
                      >
                        <p className="text-sm font-semibold text-white">Schedule Ahead</p>
                        <p className="text-xs text-slate-400 mt-0.5">Pick a specific date and time slot.</p>
                      </button>
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className={btnSecondary + " text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"}>Back</button>
                </motion.div>
              )}

              {/* Step 4: Date & Time (scheduled) OR Details (queue) */}
              {step === 4 && bookingType === 'scheduled' && (
                <motion.div key="s4sched" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Step 4 of {totalSteps}</p>
                    <h3 className="text-lg font-semibold text-white mb-5">Choose date & time</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls + " text-slate-400"}>Date</label>
                        <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={selectCls}>
                          <option value="">Select date...</option>
                          {dates.map(d => d && (
                            <option key={d.full} value={d.full}>
                              {d.isToday ? 'Today' : ''} {d.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls + " text-slate-400"}>Time</label>
                        <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className={selectCls}>
                          <option value="">Select time...</option>
                          {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(3)} className={btnSecondary + " text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"}>Back</button>
                    <button onClick={() => selectedDate && selectedTime && setStep(5)} disabled={!selectedDate || !selectedTime} className={btnPrimary}>Next</button>
                  </div>
                </motion.div>
              )}

              {/* Step 4 for queue / Step 5 for scheduled: Client Details */}
              {((step === 4 && bookingType === 'queue') || (step === 5 && bookingType === 'scheduled')) && (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                      Step {bookingType === 'scheduled' ? '5' : '4'} of {totalSteps}
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-5">Your details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls + " text-slate-400"}>Full Name</label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          placeholder="Your name"
                          className={selectCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls + " text-slate-400"}>Phone Number</label>
                        <input
                          type="tel"
                          value={clientPhone}
                          onChange={e => setClientPhone(e.target.value)}
                          placeholder="+27 60 000 0000"
                          className={selectCls}
                        />
                      </div>
                      {partySize > 1 && (
                        <p className="text-xs text-slate-500 border border-slate-700 p-3">
                          Booking for {partySize} people · R{totalPrice} total · We'll accommodate everyone in consecutive slots.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(bookingType === 'scheduled' ? 4 : 3)} className={btnSecondary + " text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"}>Back</button>
                    <button onClick={submitBooking} disabled={!clientName || !clientPhone || loading} className={btnPrimary}>
                      {loading ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && confirmed && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border border-slate-700 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Booking Confirmed</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Service</span>
                  <span className="text-white font-medium">{confirmed.serviceName}</span>
                </div>
                {confirmed.partySize > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Party</span>
                    <span className="text-white font-medium">{confirmed.partySize} people</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-medium capitalize">{confirmed.type === 'queue' ? 'Walk-in Queue' : 'Scheduled'}</span>
                </div>
                {confirmed.type === 'scheduled' && confirmed.scheduledDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Date & Time</span>
                    <span className="text-white font-medium">{confirmed.scheduledDate} at {confirmed.scheduledTime}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total</span>
                  <span className="text-white font-medium">R{confirmed.totalPaid}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white font-medium">{confirmed.userName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-white font-medium">{confirmed.userPhone}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We look forward to seeing you. Please arrive 5 minutes before your scheduled time.
              Klipfontein View, Nancy Ndamase Street, Midrand.
            </p>
            <button onClick={reset} className={btnSecondary + " text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"}>
              Done
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};


const WelcomeJourney = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setEmailError('Invalid email');
      return;
    }
    setEmailError('');
    setSubscribed(true);
  };

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916400/WhatsApp_Image_2026-04-22_at_14.50.02_bgba6b.jpg')] bg-cover opacity-20 hidden md:block"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-transparent to-slate-900 z-10 hidden md:block"></div>
          
          <div className="relative z-20 max-w-xl">
            <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-8 block">Exclusive Entry</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-8">
              Join The <br /> <span className="text-brand-blue italic font-serif lowercase tracking-normal">Inner Circle</span>
            </h2>
            <p className="text-white/40 text-sm md:text-lg mb-12 leading-relaxed font-serif italic">
              New customers get an automated 20% discount code on their first session. Join our newsletter to receive grooming guides and priority slot alerts.
            </p>

            {subscribed ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-brand-red rounded-3xl text-white text-center relative overflow-hidden">
                <motion.div 
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white"
                />
                <div className="relative z-10">
                  <p className="font-black uppercase tracking-widest text-xs mb-2">Check Your Inbox!</p>
                  <p className="text-sm font-bold opacity-80 italic font-serif">Welcome to the Sizabantu family.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="your@email.com"
                    required
                    className={`w-full bg-white/5 border ${emailError ? 'border-brand-red' : 'border-white/10'} px-8 py-5 rounded-2xl text-white font-bold outline-none focus:border-brand-blue transition-all`}
                  />
                  {emailError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-6 left-4 text-[10px] text-brand-red font-black uppercase tracking-widest">{emailError}</motion.p>
                  )}
                </div>
                <button type="submit" className="bg-white text-slate-900 px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[8px] hover:bg-brand-red hover:text-white transition-all shadow-xl relative overflow-hidden shrink-0 h-fit">
                  <span className="relative z-10">Sign Me Up</span>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-full -left-full w-[300%] h-[300%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(59,130,246,0.1)_360deg)]"
                  />
                </button>
              </form>
            )}
          </div>

          <div className="relative z-20 flex-shrink-0">
             <motion.div 
              animate={{ rotate: 6 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="w-56 h-56 bg-brand-red rounded-[3rem] border-8 border-white/10 shadow-2xl overflow-hidden"
             >
                <img src="https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916400/WhatsApp_Image_2026-04-22_at_14.24.26_oeviud.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Welcome" />
             </motion.div>
             <motion.div 
              animate={{ 
                rotate: [-12, -8, -12],
                y: [0, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 w-24 h-24 bg-brand-blue rounded-3xl border-4 border-slate-900 flex items-center justify-center p-4 shadow-xl"
             >
                <Scissors className="w-10 h-10 text-white" />
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Membership = () => (
  <section id="membership" className="py-20 bg-white scroll-mt-20">
    <div className="max-w-4xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2">Sizabantu</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Membership & Loyalty</h2>
      </div>

      {/* Loyalty Programme */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900 mb-3">Stamp Card</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Every visit earns you a stamp. Collect 5 stamps and receive a free cap. 
            Collect 10 stamps and your next haircut is on us.
          </p>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={`aspect-square border ${i < 5 ? 'border-slate-900 bg-slate-900' : 'border-slate-200'} flex items-center justify-center`}>
                {i < 5 && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">5 = Free Cap · 10 = Free Cut</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900 mb-3">Member Benefits</h3>
          <ul className="space-y-3">
            {[
              'Priority queue placement',
              'Booking history & receipts',
              'Loyalty reward tracking',
              'Exclusive member pricing',
              'Early access to new services',
            ].map(b => (
              <li key={b} className="flex items-start gap-3 text-sm text-slate-600">
                <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Membership Tiers */}
      <div className="border-t border-slate-100 pt-10">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900 mb-6">Membership Tiers</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Regular', visits: '0–9 visits', perks: ['Stamp card', 'Online booking', 'Visit history'] },
            { name: 'Gold', visits: '10–24 visits', perks: ['All Regular perks', '5% discount', 'Priority queue'] },
            { name: 'Elite', visits: '25+ visits', perks: ['All Gold perks', '10% discount', 'Reserved slots', 'Complimentary trim touch-ups'] },
          ].map(tier => (
            <div key={tier.name} className={`p-5 border ${tier.name === 'Elite' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100'}`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 opacity-60">{tier.visits}</p>
              <p className={`text-lg font-bold mb-4 ${tier.name === 'Elite' ? 'text-white' : 'text-slate-900'}`}>{tier.name}</p>
              <ul className="space-y-2">
                {tier.perks.map(p => (
                  <li key={p} className={`text-xs ${tier.name === 'Elite' ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-slate-100 pt-10 mt-10">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900 mb-6">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Sign In', desc: 'Create your account when booking. No forms, just Google or email.' },
            { step: '02', title: 'Visit & Earn', desc: 'Every completed session automatically adds a stamp to your card.' },
            { step: '03', title: 'Redeem Rewards', desc: 'Rewards unlock automatically. Claim them at reception on your next visit.' },
          ].map(item => (
            <div key={item.step}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{item.step}</p>
              <p className="text-sm font-semibold text-slate-900 mb-2">{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-100">
        <a href="#book" className="inline-block border border-slate-900 text-slate-900 px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors">
          Book & Start Earning
        </a>
      </div>
    </div>
  </section>
);

const TopNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  
  const navLinks = [
    { name: 'Book Now', href: '#book' },
    { name: 'Gallery', href: '#portfolio' },
    { name: 'Membership', href: '#membership' },
  ];

  const handleLoginClick = () => {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

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
          
          {profile?.role === 'admin' && (
            <a href="#admin-hub" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue animate-pulse">Admin Hub</a>
          )}

          <div className="h-4 w-px bg-slate-200"></div>

          {profile ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">{profile.displayName?.split(' ')[0]}</span>
                </div>
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-brand-red">{profile.stamps || 0}/10 Stamps</span>
              </div>
              <button onClick={logout} className="p-2.5 bg-slate-50 text-slate-400 hover:text-brand-red hover:bg-brand-red/5 rounded-2xl transition-all">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <motion.button 
              onClick={handleLoginClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200/50 transition-all flex items-center gap-2 group"
            >
              <User className="w-3 h-3 group-hover:rotate-12 transition-transform" />
              Member Login
            </motion.button>
          )}
        </div>

        {/* Mobile Header Elements */}
        <div className="flex md:hidden items-center gap-2">
          {profile ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black uppercase tracking-tight text-slate-900 leading-none">{profile.displayName?.split(' ')[0]}</span>
                <span className="text-[7px] font-black text-brand-red leading-none mt-0.5">{profile.stamps || 0} Stamps</span>
              </div>
              <button 
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleLoginClick} className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center border border-slate-100 active:scale-95">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          )}
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
              <div className="flex justify-between items-center mb-16 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red">Express</span>
                  <span className="text-2xl font-black uppercase tracking-tighter text-slate-900">Navigation</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-5 h-5 text-slate-900" />
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

              {profile && (
                 <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="mt-8 flex items-center gap-3 w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-brand-red/5 hover:text-brand-red transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Account
                </motion.button>
              )}

              <div className="mt-auto pt-10 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 text-center md:text-left">Let's Connect</p>
                <div className="flex justify-center md:justify-start gap-8">
                  <a href="https://www.instagram.com/sizabantub/" className="group flex flex-col items-center gap-2">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-brand-red transition-all">
                      <InstagramIcon className="w-6 h-6" />
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
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen bg-slate-900 flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Parallax and technical overlay */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916389/WhatsApp_Image_2026-04-22_at_21.13.26_t3c8ji.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900 to-slate-900"></div>
        {/* Dynamic mesh pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 px-6 py-2.5 bg-brand-red/10 border border-brand-red/20 rounded-full mb-12 backdrop-blur-md shadow-2xl"
          >
            <div className="w-2 h-2 bg-brand-red rounded-full animate-ping shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-red">Now Accepting Bookings</span>
          </motion.div>

          {/* Main Title */}
          <div className="relative mb-12">
            <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter text-white leading-[0.8] drop-shadow-2xl">
              Legacy <br /> 
              <span className="text-brand-blue italic font-serif lowercase tracking-normal bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-white/80">Grooming</span>
            </h1>
            {/* Background floating element */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full pointer-events-none opacity-20"
            />
          </div>
          
          <p className="text-white/40 text-sm md:text-xl max-w-2xl font-serif italic mb-16 leading-relaxed">
            "Exceptional grooming for the modern gentleman." Secure your slot in the elite queue or schedule your next transformation in Midrand.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-8">
            <motion.a 
              href="#book"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-brand-red text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm text-center shadow-2xl relative overflow-hidden group min-w-[240px]"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Zap className="w-5 h-5 fill-white" />
                <span>Quick Book Now</span>
              </div>
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            </motion.a>

            <motion.a 
              href="#pricing"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm text-center hover:bg-white/10 transition-all relative group min-w-[240px]"
            >
              <div className="flex items-center justify-center gap-3">
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.a>
          </div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-24 flex items-center gap-12 border-t border-white/5 pt-12 md:px-12"
          >
            <div className="text-left">
              <p className="text-white text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Customer Satisfaction</p>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-left">
              <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Trusted By</p>
              <p className="text-white text-xl font-black">1200+ <span className="text-[10px] opacity-40">MEMBERS</span></p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 left-6 z-20 hidden lg:flex items-center gap-6 text-white">
        <div className="w-12 h-px bg-white/20"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Based in Gauteng, South Africa</p>
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
            className="h-24 md:h-32 object-contain drop-shadow-xl"
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
        </motion.div>
      </div>
    </section>
  );
};

const HaircutPricing = () => {
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
              src="https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916400/WhatsApp_Image_2026-04-22_at_14.50.03_kwvaiv.jpg" 
              alt="Barbershop Background" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            {/* Active Effect: Floating Particles or Sheen */}
            <motion.div 
              animate={{ translateX: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
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
                {SERVICES.map((item, idx) => (
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
                      <span className="text-xl font-black font-mono text-brand-red">R{item.price}</span>
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
                  className="flex items-center gap-3 bg-brand-red text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-brand-dark transition-all shadow-lg shadow-red-100"
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


// --- Portfolio Component (Enhanced Gallery) ---

const Portfolio = () => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  const images = [
    { url: "https://res.cloudinary.com/dggitwduo/image/upload/v1776183249/WhatsApp_Image_2026-04-14_at_11.14.44_1_aqb6zl.jpg", title: "Signature Fade", size: "large", category: "Master Selection" },
    { url: "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916394/WhatsApp_Image_2026-04-22_at_14.37.03_inompp.jpg", title: "Beard Sculpt", size: "small", category: "Grooming" },
    { url: "https://res.cloudinary.com/dggitwduo/image/upload/v1776191196/WhatsApp_Image_2026-04-14_at_11.14.50_wdxnqw.jpg", title: "Classic Taper", size: "small", category: "Traditional" },
    { url: "https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png", title: "The Legacy", size: "medium", isLogo: true },
    { url: "https://res.cloudinary.com/dggitwduo/image/upload/v1776181782/WhatsApp_Image_2026-04-14_at_11.14.49_nyfjzx.jpg", title: "Razor Edge", size: "small", category: "Detailing" },
    { url: "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916392/WhatsApp_Image_2026-04-22_at_14.24.28_1_xjcyrp.jpg", title: "Textured Crop", size: "small", category: "Modern" },
    { url: "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916386/WhatsApp_Image_2026-04-22_at_14.37.02_nvonum.jpg", title: "Master Craft", size: "medium", category: "Atmosphere" },
    { url: "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916388/4_ulva3v.jpg", title: "Sharp Definition", size: "small", category: "Finish" },
    { url: "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916386/7_vy9uut.jpg", title: "Precision Tools", size: "small", category: "Artistry" },
    { url: "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916381/66_wencyp.jpg", title: "The Sanctuary", size: "medium", category: "Interior" },
  ];

  const galleryImages = [
    "https://res.cloudinary.com/dggitwduo/image/upload/v1776183249/WhatsApp_Image_2026-04-14_at_11.14.44_1_aqb6zl.jpg",
    "https://res.cloudinary.com/dggitwduo/image/upload/v1776181782/WhatsApp_Image_2026-04-14_at_11.14.49_nyfjzx.jpg",
    "https://res.cloudinary.com/dggitwduo/image/upload/v1776191196/WhatsApp_Image_2026-04-14_at_11.14.50_wdxnqw.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916400/WhatsApp_Image_2026-04-22_at_14.50.02_bgba6b.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916400/WhatsApp_Image_2026-04-22_at_14.24.26_oeviud.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916400/WhatsApp_Image_2026-04-22_at_14.50.03_kwvaiv.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916394/WhatsApp_Image_2026-04-22_at_14.37.03_inompp.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916391/WhatsApp_Image_2026-04-22_at_14.24.28_acv3zd.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916392/WhatsApp_Image_2026-04-22_at_14.24.28_1_xjcyrp.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916386/WhatsApp_Image_2026-04-22_at_14.37.02_nvonum.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916388/4_ulva3v.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916386/7_vy9uut.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916381/66_wencyp.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916379/22_trq3co.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916379/9_mvko7b.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916375/55_xldoai.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916371/11_sw6zqj.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916361/6_qo2avl.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916353/0_tlqd2e.jpg",
    "https://res.cloudinary.com/dk8jbgjhl/image/upload/q_auto/f_auto/v1777916389/WhatsApp_Image_2026-04-22_at_21.13.26_t3c8ji.jpg"
  ];

  return (
    <section id="portfolio" className="py-32 bg-white text-slate-900 overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
          <div className="max-w-2xl">
            <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Our Work</span>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              Dream Cut <br /> <span className="italic font-serif text-brand-blue lowercase tracking-normal">Reality</span>
            </h2>
          </div>
          <p className="text-lg text-slate-400 font-medium max-w-sm leading-relaxed italic font-serif">
            A curated showcase of precision, style, and the dedication we put into every single session.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[200px] md:auto-rows-[260px] gap-4 md:gap-6">
          {images.map((img, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-[2.5rem] overflow-hidden group cursor-pointer border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-brand-blue/10
                ${img.size === 'large' ? 'col-span-2 row-span-2 md:col-span-4 md:row-span-2' : ''}
                ${img.size === 'medium' ? 'col-span-2 row-span-1 md:col-span-2 md:row-span-1' : ''}
              `}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {img.isLogo ? (
                <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-brand-red/40 via-brand-dark/20 to-brand-blue/20 backdrop-blur-[2px]">
                  <img 
                    src="https://res.cloudinary.com/dggitwduo/image/upload/v1775631839/SB_BARBER_LOGO_evz0fu.png" 
                    alt="SB Logo" 
                    className="h-32 md:h-56 w-auto object-contain brightness-0 invert drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    className="transform transition-transform duration-500"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red/80 mb-2 block">{img.category}</span>
                    <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">{img.title}</h4>
                  </motion.div>
                </div>
              )}

              {/* Status Indicator REMOVED */}
            </motion.div>
          ))}
        </div>

        {/* View Gallery and Instagram Buttons */}
        <div className="mt-20 md:mt-32 flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 overflow-visible">
            <motion.button 
            onClick={() => setShowGallery(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-1 items-center justify-center gap-6 bg-brand-red text-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] group shadow-3xl shadow-red-200 transition-all max-w-xl"
          >
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors mb-2">The Collection</span>
              <span className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none italic font-serif lowercase">View gallery</span>
            </div>
            <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-3xl md:rounded-[2rem] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-brand-red transition-all">
              <Camera className="w-8 h-8 md:w-12 md:h-12" />
            </div>
          </motion.button>
          
          <motion.a 
            href="https://www.instagram.com/sizabantub/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-1 items-center gap-8 bg-slate-900 text-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] group shadow-3xl shadow-slate-200 transition-all max-w-xl"
          >
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-brand-red transition-colors mb-2">Connect With Us</span>
              <span className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">Instagram</span>
            </div>
            <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-3xl md:rounded-[2rem] flex items-center justify-center shrink-0 group-hover:bg-brand-red transition-all">
              <InstagramIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </div>
          </motion.a>
        </div>

        {/* Full Gallery Overlay */}
        <AnimatePresence>
          {showGallery && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[1000] bg-white overflow-y-auto"
            >
              <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 md:p-12 flex justify-between items-center">
                <div>
                  <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Full Collection</span>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Sizabantu Gallery</h2>
                </div>
                <button 
                  onClick={() => setShowGallery(false)}
                  className="p-3 bg-slate-900 text-white rounded-xl hover:bg-brand-red transition-all group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <div className="max-w-7xl mx-auto p-2 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  {galleryImages.map((src, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="relative aspect-square overflow-hidden group cursor-pointer bg-slate-50"
                      onClick={() => setSelectedGalleryImg(src)}
                    >
                      <img 
                        src={src} 
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          <CheckCircle2 className="w-5 h-5 text-brand-red" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Individual Image Lightbox */}
        <AnimatePresence>
          {selectedGalleryImg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100] bg-slate-900/98 flex items-center justify-center p-6"
              onClick={() => setSelectedGalleryImg(null)}
            >
              <button 
                className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-brand-red rounded-2xl text-white transition-all backdrop-blur-md z-[1200]"
                onClick={(e) => { e.stopPropagation(); setSelectedGalleryImg(null); }}
              >
                <X className="w-8 h-8" />
              </button>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-5xl w-full max-h-[80vh] flex items-center justify-center"
              >
                <img 
                  src={selectedGalleryImg}
                  alt="Selected Gallery Item"
                  className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border-4 border-white/10"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<any>({});
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.email) newErrors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.message) newErrors.message = "Required";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

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
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Electronic Mail</p>
                  <p className="text-2xl md:text-3xl font-black tracking-tight">sizabantubarbershop.co.za</p>
                </div>
              </div>
            </div>

            <div className="mt-20 flex gap-6">
              <a href="https://www.instagram.com/sizabantub/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-slate-100 flex items-center justify-center rounded-full text-slate-400 hover:bg-brand-red hover:text-white hover:border-brand-red transition-all">
                <InstagramIcon className="w-4 h-4" />
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
            
            <div className="p-12 glass rounded-[3rem] border border-slate-200 shadow-2xl relative overflow-hidden">
               <AnimatePresence>
                {isSent && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-brand-blue/90 backdrop-blur-md z-50 flex items-center justify-center p-8 text-center"
                  >
                    <div className="text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Message Sent</h3>
                      <p className="text-white/60 font-serif italic">We'll get back to you shortly.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-10">Direct Message</h4>
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                       {errors.name && <span className="text-[8px] text-brand-red font-black uppercase">{errors.name}</span>}
                    </div>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full bg-white border ${errors.name ? 'border-brand-red' : 'border-slate-200'} rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue transition-all font-bold text-sm`} 
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                       {errors.email && <span className="text-[8px] text-brand-red font-black uppercase">{errors.email}</span>}
                    </div>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full bg-white border ${errors.email ? 'border-brand-red' : 'border-slate-200'} rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue transition-all font-bold text-sm`} 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</label>
                     {errors.message && <span className="text-[8px] text-brand-red font-black uppercase">{errors.message}</span>}
                  </div>
                  <textarea 
                    placeholder="Tell us about your dream cut..." 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={`w-full bg-white border ${errors.message ? 'border-brand-red' : 'border-slate-200'} rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue transition-all resize-none font-bold text-sm`}
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-brand-red text-white hover:bg-brand-dark py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-4">
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
                <InstagramIcon className="w-4 h-4" />
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
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-brand-red" /> sizabantubarbershop.co.za</li>
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
  const { user, profile, loading } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-blue selection:text-white">
      <NotificationCenter />
      <TopNav />
      <main className="transition-all duration-500">
        <Hero />
        <Mission />
        
        {/* Conditional Admin Hub */}
        {profile?.role === 'admin' && (
          <div id="admin-hub" className="scroll-mt-32">
            <ErrorBoundary name="AdminDashboard">
              <AdminDashboard />
            </ErrorBoundary>
          </div>
        )}
        
        <ErrorBoundary name="BookingSystem">
          <BookingSystem profile={profile} />
        </ErrorBoundary>
        <WelcomeJourney />
        <HaircutPricing />
        <Membership />
        <Portfolio />
        <ContactSection />
        <Footer />
      </main>
      <BackToTop />
    </div>
  );
}
