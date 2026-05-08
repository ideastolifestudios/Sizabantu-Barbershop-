import { Booking } from '../types';

export class NotificationService {
  private static async sendWassenger(to: string, message: string) {
    if (!process.env.WASSENGER_API_KEY) return;
    
    try {
      await fetch('https://api.wassenger.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': process.env.WASSENGER_API_KEY
        },
        body: JSON.stringify({ phone: to, message })
      });
    } catch (error) {
      console.error('Wassenger error:', error);
    }
  }

  static async sendBookingConfirmation(booking: Booking) {
    const date = new Date(booking.date).toLocaleDateString('en-ZA');
    const message = `*Sizabantu Barbershop*\n\nHi ${booking.customerName}, your booking is confirmed for ${date} at ${booking.slot}.\n\nRef: ${booking.id}`;
    
    if (booking.customerPhone) {
      await this.sendWassenger(booking.customerPhone, message);
    }
  }

  static async sendEmail(to: string, subject: string, htmlContent: string) {
    if (!process.env.RESEND_API_KEY) return;
    
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: process.env.NOTIFICATION_FROM_EMAIL || 'noreply@sizabantubarbershop.co.za',
          to,
          subject,
          html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;">${htmlContent.replace(/\n/g, "<br>").replace(/\*(.*?)\*/g, "<strong>$1</strong>")}</div>`
        })
      });
    } catch (error) {
      console.error('Email error:', error);
    }
  }
}
