"use client";
import { useLazyLoad } from "@/lib/utils/performance";

interface StampCardProps {
  stamps: number;
  totalNeeded?: number;
  className?: string;
}

/**
 * Digital loyalty stamp card.
 * Shows filled/empty stamps with milestone indicators.
 */
export function StampCard({ stamps, totalNeeded = 10, className = "" }: StampCardProps) {
  const [ref, visible] = useLazyLoad();

  return (
    <div ref={ref} className={`szb-card ${className}`}>
      <div style={{ marginBottom: 16 }}>
        <span className="szb-label">Magic Stamp Card</span>
        <p style={{ fontSize: "11px", color: "var(--szb-muted)", marginTop: 4 }}>
          {stamps < 5
            ? `${5 - stamps} stamps to free cap`
            : stamps < 10
            ? `${10 - stamps} stamps to free haircut`
            : "Reward ready to claim!"}
        </p>
      </div>

      {visible && (
        <>
          {/* Top row: 5 stamps */}
          <div className="szb-stamp-grid" style={{ marginBottom: 8 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`szb-stamp ${i < stamps ? "filled" : ""} szb-animate-up`}
                style={{ animationDelay: `${i * 60}ms` }}
                aria-label={i < stamps ? "Stamp collected" : "Empty stamp"}
              >
                {i < stamps && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--szb-black)">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Milestone 1 label */}
          <p style={{ fontSize: "9px", color: stamps >= 5 ? "var(--szb-gold)" : "var(--szb-muted)", textAlign: "center", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {stamps >= 5 ? "✓ Free Cap Unlocked" : "5 fills → Free Cap"}
          </p>

          {/* Bottom row: 5 stamps */}
          <div className="szb-stamp-grid" style={{ marginBottom: 8 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i + 5}
                className={`szb-stamp ${i + 5 < stamps ? "filled" : ""} szb-animate-up`}
                style={{ animationDelay: `${(i + 5) * 60}ms` }}
                aria-label={i + 5 < stamps ? "Stamp collected" : "Empty stamp"}
              >
                {i + 5 < stamps && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--szb-black)">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Milestone 2 label */}
          <p style={{ fontSize: "9px", color: stamps >= 10 ? "var(--szb-gold)" : "var(--szb-muted)", textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {stamps >= 10 ? "✓ Free Haircut Unlocked!" : "10 fills → Free Haircut"}
          </p>
        </>
      )}

      {/* Progress bar */}
      <div
        style={{
          marginTop: 16,
          height: 2,
          background: "var(--szb-border)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min((stamps / totalNeeded) * 100, 100)}%`,
            background: "var(--szb-gold)",
            borderRadius: 2,
            transition: "width 0.8s var(--szb-ease)",
          }}
        />
      </div>
      <p style={{ fontSize: "10px", color: "var(--szb-muted)", textAlign: "right", marginTop: 6 }}>
        {stamps}/{totalNeeded}
      </p>
    </div>
  );
}
