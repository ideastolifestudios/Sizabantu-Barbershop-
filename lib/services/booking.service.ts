import { Booking } from '../types';
import { db } from '../firebase/client';
import { collection, doc, updateDoc, getDoc } from 'firebase/firestore';

export class BookingService {
  static async checkInBooking(id: string) {
    const bookingRef = doc(db, 'bookings', id);
    const snap = await getDoc(bookingRef);
    
    if (!snap.exists()) throw new Error('Booking not found');
    
    const data = snap.data();
    await updateDoc(bookingRef, {
      status: 'checked-in',
      checkedInAt: new Date().toISOString()
    });

    // We return the object correctly without duplicate 'id' keys
    return {
      id,
      ...data,
      status: 'checked-in'
    };
  }
}
