"use client";

import { useState, useEffect } from "react";
import Icon from "./icons";
import PlatformMonitor from "./platform-monitor";
import WtwSimulator from "./wtw-simulator";

function useClock() {
  const [time, setTime] = useState<Date | null>(null);
  
  useEffect(() => {
    const handle = setTimeout(() => {
      setTime(new Date());
    }, 0);
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearTimeout(handle);
      clearInterval(id);
    };
  }, []);

  return time;
}

export default function MetroApp() {
  const [activeTab, setActiveTab] = useState<"monitor" | "sim">("monitor");
  const [tweaks, setTweaks] = useState({ tickSpeed: 1.0, heatIntensity: 1.0 });
  const time = useClock();

  const renderClock = () => {
    if (!time) {
      return <div className="clock">00:00<span className="ms">:00</span></div>;
    }
    const hhmm = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const ss = String(time.getSeconds()).padStart(2, "0");
    return (
      <div className="clock">
        {hhmm}<span className="ms">:{ss}</span>
      </div>
    );
  };

  return (
    <div className="metro-root">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div className="brand">
          <span className="linebadge">M2</span>
          <div>
            <h1>METROPOLIS</h1>
            <span className="sub">OPERATIONS CONTROL</span>
          </div>
        </div>

        <nav className="tabs">
          <button
            className={`tab ${activeTab === "monitor" ? "on" : ""}`}
            onClick={() => setActiveTab("monitor")}
          >
            <span className="dot" />
            Platform Monitor
          </button>
          <button
            className={`tab ${activeTab === "sim" ? "on" : ""}`}
            onClick={() => setActiveTab("sim")}
          >
            <span className="dot" />
            WTW Simulator
          </button>
        </nav>

        <div className="spacer" />

        {/* Global Tweaks Controls (Inline Desktop Header) */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginRight: "16px" }} className="topbar-tweaks">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--muted)" }}>
            <span>SPEED:</span>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.5"
              value={tweaks.tickSpeed}
              onChange={(e) => setTweaks((t) => ({ ...t, tickSpeed: parseFloat(e.target.value) }))}
              style={{ width: "60px", height: "4px", accentColor: "var(--blue)", cursor: "pointer", background: "var(--bg-deep)", border: "1px solid var(--line)", borderRadius: "2px" }}
            />
            <b style={{ color: "var(--blue)", fontFamily: "var(--fs-mono)" }}>{tweaks.tickSpeed.toFixed(1)}x</b>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--muted)" }}>
            <span>HEAT:</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={tweaks.heatIntensity}
              onChange={(e) => setTweaks((t) => ({ ...t, heatIntensity: parseFloat(e.target.value) }))}
              style={{ width: "60px", height: "4px", accentColor: "var(--blue)", cursor: "pointer", background: "var(--bg-deep)", border: "1px solid var(--line)", borderRadius: "2px" }}
            />
            <b style={{ color: "var(--blue)", fontFamily: "var(--fs-mono)" }}>{tweaks.heatIntensity.toFixed(1)}x</b>
          </div>
        </div>

        <div className="statuschips">
          <div className="chip">
            <span className="led live" />
            FEED: <b>LIVE</b>
          </div>
          <div className="chip">
            <span className="led ok" />
            SYSTEM: <b>OK</b>
          </div>
        </div>

        {renderClock()}
      </header>

      {/* Main Content Area */}
      <main className="view">
        {activeTab === "monitor" ? (
          <PlatformMonitor tweaks={tweaks} />
        ) : (
          <WtwSimulator tweaks={tweaks} />
        )}
      </main>

      {/* Mobile Tab Navigation */}
      <nav className="mtabs">
        <button
          className={activeTab === "monitor" ? "on" : ""}
          onClick={() => setActiveTab("monitor")}
        >
          <Icon name="monitor" size={20} />
          <span>Monitor</span>
        </button>
        <button
          className={activeTab === "sim" ? "on" : ""}
          onClick={() => setActiveTab("sim")}
        >
          <Icon name="sim" size={20} />
          <span>Simulator</span>
        </button>
      </nav>
    </div>
  );
}
