"use client";
import { useState, useRef } from "react";

interface ShopMapProps {
  className?: string;
  height?: number;
}

/**
 * Interactive Google Maps embed for Sizabantu Barbershop.
 * Uses iframe embed — no API key required.
 * Lazy-loads the iframe on intersection for performance.
 */
export function ShopMap({ className = "", height = 400 }: ShopMapProps) {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Activate on click to avoid auto-loading on page scroll
  const handleActivate = () => setActive(true);

  const mapSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.123456789!2d28.1277!3d-25.9917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDU5JzMwLjEiUyAyOMKwMDcnMzkuNyJF!5e0!3m2!1sen!2sza!4v1000000000000!5m2!1sen!2sza";

  const directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Klipfontein+View+644+Nancy+Ndamase+Street+Midrand+Gauteng+South+Africa";

  return (
    <div className={`relative overflow-hidden bg-szb-surface border border-szb-border rounded-szb ${className}`}>
      {/* Map iframe */}
      <div
        ref={ref}
        className="relative"
        style={{ height, cursor: active ? "default" : "pointer" }}
        onClick={!active ? handleActivate : undefined}
        role={!active ? "button" : undefined}
        aria-label={!active ? "Click to load map" : undefined}
        tabIndex={!active ? 0 : undefined}
        onKeyDown={!active ? (e) => { if (e.key === "Enter") handleActivate(); } : undefined}
      >
        {active ? (
          <iframe
            src={mapSrc}
            width="100%"
            height={height}
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
            title="Sizabantu Barbershop location map"
          />
        ) : (
          /* Placeholder until activated */
          <div
            className="flex flex-col items-center justify-center gap-4"
            style={{ height, background: "var(--szb-dark)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--szb-gold)" }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--szb-gold)", marginBottom: 4 }}>
                Klipfontein View, Midrand
              </p>
              <p style={{ fontSize: "10px", color: "var(--szb-muted)" }}>
                644 Nancy Ndamase Street
              </p>
              <p style={{ fontSize: "10px", color: "var(--szb-faint)", marginTop: 12 }}>
                Click to load map
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {active && !loaded && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--szb-dark)" }}>
            <div
              style={{
                width: 24, height: 24,
                border: "2px solid var(--szb-border)",
                borderTopColor: "var(--szb-gold)",
                borderRadius: "50%",
                animation: "szb-spin 0.7s linear infinite",
              }}
            />
          </div>
        )}
      </div>

      {/* Footer info bar */}
      <div
        className="flex items-center justify-between gap-4 flex-wrap"
        style={{ padding: "14px 20px", borderTop: "1px solid var(--szb-border)" }}
      >
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600 }}>Sizabantu Barbershop</p>
          <p style={{ fontSize: "10px", color: "var(--szb-muted)", marginTop: 2 }}>
            644 Nancy Ndamase St, Klipfontein View · Tue–Sun 09:00–18:00
          </p>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="szb-btn szb-btn-outline"
          style={{ padding: "8px 16px", fontSize: "9px" }}
          aria-label="Get directions to Sizabantu Barbershop"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Directions
        </a>
      </div>
    </div>
  );
}
