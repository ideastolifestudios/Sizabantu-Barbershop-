"use client";
import { useQueue } from "@/lib/hooks/useQueue";
import { formatWait } from "@/lib/utils/queue-code";

/**
 * Real-time queue status widget.
 * Subscribes to Firestore onSnapshot — updates automatically.
 */
export function LiveQueue() {
  const { myEntry, loading } = useQueue();

  if (loading) {
    return (
      <div className="szb-card flex items-center justify-center" style={{ minHeight: 160 }}>
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
    );
  }

  if (!myEntry) {
    return (
      <div className="szb-card" style={{ textAlign: "center", padding: 32 }}>
        <span className="szb-label" style={{ display: "block", marginBottom: 8 }}>
          Queue Status
        </span>
        <p style={{ color: "var(--szb-muted)", fontSize: "13px" }}>
          You are not currently in the queue.
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    waiting:    "var(--szb-muted)",
    notified:   "var(--szb-amber, #d97706)",
    "checked-in": "var(--szb-green)",
    serving:    "var(--szb-gold)",
    completed:  "#4caf6e",
  };

  return (
    <div className="szb-card szb-animate-up" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background glow when serving */}
      {myEntry.status === "serving" && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span className="szb-label">Your Queue Position</span>
        <span
          className="szb-badge"
          style={{
            background: "transparent",
            border: `1px solid ${statusColors[myEntry.status] || "var(--szb-border)"}`,
            color: statusColors[myEntry.status] || "var(--szb-muted)",
            textTransform: "uppercase",
            fontSize: "8px",
            letterSpacing: "0.15em",
          }}
        >
          {myEntry.status.replace("-", " ")}
        </span>
      </div>

      {/* Position number */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
        <span className="szb-queue-position">#{myEntry.position}</span>
        <div style={{ paddingBottom: 12 }}>
          <p style={{ fontSize: "10px", color: "var(--szb-muted)", letterSpacing: "0.08em" }}>
            est. wait
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--szb-cream)" }}>
            {formatWait(myEntry.estimatedWaitMinutes)}
          </p>
        </div>
      </div>

      {/* Queue code + token */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--szb-dark)", padding: "12px 14px", borderRadius: "var(--szb-radius)" }}>
          <p style={{ fontSize: "9px", color: "var(--szb-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Queue Code</p>
          <p style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--szb-gold)" }}>
            {myEntry.queueCode}
          </p>
        </div>
        <div style={{ background: "var(--szb-dark)", padding: "12px 14px", borderRadius: "var(--szb-radius)" }}>
          <p style={{ fontSize: "9px", color: "var(--szb-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Token</p>
          <p style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--szb-cream)" }}>
            {myEntry.sessionToken}
          </p>
        </div>
      </div>

      {myEntry.status === "notified" && (
        <div
          className="szb-pulse-gold"
          style={{
            marginTop: 16, padding: "12px 16px",
            background: "rgba(201,168,76,0.1)",
            border: "1px solid var(--szb-gold)",
            borderRadius: "var(--szb-radius)",
            fontSize: "11px", fontWeight: 600, color: "var(--szb-gold)",
            textAlign: "center",
          }}
        >
          You&apos;re next! Head to the shop now — 15 min window.
        </div>
      )}
    </div>
  );
}
