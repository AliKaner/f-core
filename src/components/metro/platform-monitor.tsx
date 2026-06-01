"use client";

import { useState, useEffect, useRef } from "react";
import Icon from "./icons";
import { lerp, clamp, jitter, loadColor, loadColorSoft } from "./model";

interface BlobData { x: number; y: number; r: number; int: number; hot: boolean; }
interface DotData { x: number; y: number; hot: boolean; }
interface CarData { count: number; cap: number; doorQ: number[]; }

function blobBg(int: number): string {
  if (int > 0.68) return `radial-gradient(circle, rgba(255,77,77,${int * 0.85}) 0%, rgba(255,140,46,${int * 0.42}) 42%, transparent 70%)`;
  if (int > 0.42) return `radial-gradient(circle, rgba(255,176,46,${int * 0.8}) 0%, rgba(46,155,255,${int * 0.28}) 55%, transparent 74%)`;
  return `radial-gradient(circle, rgba(46,155,255,${int * 0.7}) 0%, rgba(25,211,197,${int * 0.32}) 55%, transparent 78%)`;
}

function PlatformView({ blobs, dots, intensity }: { blobs: BlobData[]; dots: DotData[]; intensity: number }) {
  return (
    <div className="platform-wrap" style={{ height: 232 }}>
      <div className="platform-stage" style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />

        {blobs.map((b, i) => (
          <div key={i} className="heat-blob" style={{
            left: `${b.x}%`, top: `${b.y}%`, width: b.r, height: b.r,
            transform: "translate(-50%,-50%)", background: blobBg(b.int * intensity),
            opacity: 0.55 + 0.45 * b.int,
          }} />
        ))}

        {dots.map((d, i) => (
          <div key={i} className="pax-dot" style={{
            left: `${d.x}%`, top: `${d.y}%`,
            background: d.hot ? "rgba(255,190,140,.92)" : "rgba(180,220,255,.85)",
            boxShadow: d.hot ? "0 0 5px rgba(255,120,80,.7)" : "0 0 4px rgba(46,155,255,.5)",
          }} />
        ))}

        {(["L", "R"] as const).map((s) => (
          <div key={s} className="escalator" style={{ [s === "L" ? "left" : "right"]: 10, top: "50%", transform: "translateY(-50%)" }}>
            <div className="esc-steps" style={{ width: 30, height: 84 }}>
              <svg width="16" height="40" viewBox="0 0 16 40" fill="none" stroke="var(--blue)" strokeWidth="1.6">
                <path d="M3 32l5-5M3 24l5-5M3 16l5-5M3 8l5-5" />
                <path d="M8 27l5 0M8 19l5 0M8 11l5 0M8 3l5 0" opacity={0.5} />
              </svg>
            </div>
            <div className="esc-label">ESC&nbsp;{s === "L" ? "A" : "B"}</div>
            <div className="esc-label" style={{ color: "var(--green)" }}>▲ UP</div>
          </div>
        ))}

        <div className="track" style={{ bottom: 0, height: 30 }} />
        <div className="rail" style={{ bottom: 22 }} />
        <div className="rail" style={{ bottom: 7 }} />
        <div className="platedge" style={{ bottom: 31 }} />

        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="doorgap" style={{ left: `${6 + i * (88 / 23)}%`, bottom: 31, height: 14 }} />
        ))}

        <div style={{ position: "absolute", left: 12, top: 10, fontFamily: "var(--fs-mono)", fontSize: 10.5, color: "var(--muted)", letterSpacing: ".5px", lineHeight: 1.6 }}>
          <div>PLATFORM 2 · NORTHBOUND</div>
          <div style={{ color: "var(--teal)" }}>LIVE DENSITY · 1s REFRESH</div>
        </div>
        <div style={{ position: "absolute", right: 12, top: 10 }} className="legend">
          {([["LOW", "#2e9bff"], ["MOD", "#ffb02e"], ["HIGH", "#ff4d4d"]] as [string, string][]).map(([t, c]) => (
            <div key={t} className="lg"><span className="sw" style={{ background: c }} />{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainDiagram({ cars }: { cars: CarData[] }) {
  return (
    <div className="train">
      <div className="loco">
        <svg width="18" height="40" viewBox="0 0 18 40" fill="none" stroke="var(--muted)" strokeWidth="1.5">
          <path d="M4 6h10M3 14h12M9 6v28" /><circle cx="9" cy="30" r="3" />
        </svg>
      </div>
      {cars.map((c, i) => {
        const r = c.count / c.cap;
        const col = loadColor(r);
        return (
          <div key={i} className="carriage">
            <div className="ch">
              <span className="cid">CAR {i + 1}</span>
              <span className="badge" style={{ background: loadColorSoft(r), color: col }}>{c.count}/{c.cap}</span>
            </div>
            <div className="fillbar">
              <div className="fill" style={{ height: `${r * 100}%`, background: `linear-gradient(180deg, ${col}cc, ${col})` }} />
              <div className="pct" style={{ color: r > 0.5 ? "#04121e" : "var(--text)" }}>{Math.round(r * 100)}%</div>
            </div>
            <div className="doors">
              {Array.from({ length: 4 }).map((_, d) => {
                const q = c.doorQ[d];
                const dc = q > 9 ? "var(--red)" : q > 5 ? "var(--amber)" : "var(--green)";
                return <div key={d} className="door" style={{ background: dc, opacity: 0.35 + Math.min(q, 12) / 12 * 0.65 }} title={`door queue ${q}`} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QueueChart({ queues }: { queues: number[] }) {
  const max = 20;
  return (
    <div className="qchart">
      {queues.map((q, i) => {
        const h = clamp(q / max, 0.04, 1) * 100;
        const col = q > 14 ? "var(--red)" : q > 8 ? "var(--amber)" : "var(--blue)";
        return (
          <div key={i} className="qbar-col">
            <div className="qbar-track">
              <div className="qbar" style={{ height: `${h}%`, background: col, boxShadow: q > 14 ? "0 0 8px rgba(255,77,77,.5)" : "none" }} title={`Door ${i + 1}: ${q}`} />
            </div>
            <div className="qbar-lbl">{(i + 1) % 2 === 1 ? i + 1 : ""}</div>
          </div>
        );
      })}
    </div>
  );
}

interface KpiProps { label: string; val: string | number; unit?: string; accent: string; trend?: string; trendUp?: boolean; }
function Kpi({ label, val, unit, accent, trend, trendUp }: KpiProps) {
  return (
    <div className="kpi">
      <span className="accent" style={{ background: accent }} />
      <div className="label">{label}</div>
      <div className="val">{val}{unit && <small>{unit}</small>}</div>
      {trend != null && (
        <div className="trend" style={{ color: trendUp ? "var(--red)" : "var(--green)", background: trendUp ? "rgba(255,77,77,.1)" : "rgba(51,214,138,.1)" }}>
          {trendUp ? "▲" : "▼"} {trend}
        </div>
      )}
    </div>
  );
}

function usePlatformData(speed: number) {
  const [blobs, setBlobs] = useState<BlobData[]>([]);
  const [dots, setDots] = useState<DotData[]>([]);
  const [cars, setCars] = useState<CarData[]>(() =>
    [210, 268, 255, 240, 198, 176].map((n) => ({ count: n, cap: 300, doorQ: [4, 7, 5, 3] }))
  );
  const [queues, setQueues] = useState<number[]>(() =>
    Array.from({ length: 24 }, (_, i) => {
      const d = Math.min(i, 23 - i);
      return Math.round(16 - d * 1.1 + jitter(2));
    })
  );
  const [boarding, setBoarding] = useState(112);
  const tickRef = useRef(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      const bl: BlobData[] = [];
      [8, 15, 21, 79, 85, 92].forEach((cx) =>
        bl.push({ x: cx, y: 42 + jitter(16), r: lerp(74, 122, Math.random()), int: lerp(0.6, 1, Math.random()), hot: true })
      );
      for (let i = 0; i < 5; i++)
        bl.push({ x: lerp(33, 67, Math.random()), y: 44 + jitter(18), r: lerp(52, 92, Math.random()), int: lerp(0.16, 0.4, Math.random()), hot: false });
      setBlobs(bl);

      const dd: DotData[] = [];
      for (let i = 0; i < 80; i++) {
        const end = Math.random() < 0.62;
        const x = end
          ? (Math.random() < 0.5 ? lerp(3, 26, Math.random()) : lerp(74, 97, Math.random()))
          : lerp(28, 72, Math.random());
        dd.push({ x, y: lerp(22, 76, Math.random()), hot: end && Math.random() < 0.7 });
      }
      setDots(dd);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      const t = tickRef.current;
      setBlobs((bs) => bs.map((b) => ({ ...b, x: clamp(b.x + jitter(2.4), 2, 98), y: clamp(b.y + jitter(3), 24, 70), int: clamp(b.int + jitter(b.hot ? 0.14 : 0.08), b.hot ? 0.42 : 0.12, 1) })));
      setDots((ds) => ds.map((d) => ({ ...d, x: clamp(d.x + jitter(2.6), 2, 98), y: clamp(d.y + jitter(3.4), 18, 80) })));
      const depart = t % 9 === 0;
      setCars((cs) => cs.map((c) => {
        const count = depart ? Math.round(lerp(120, 200, Math.random())) : clamp(c.count + Math.round(jitter(18) + 6), 90, 298);
        const doorQ = c.doorQ.map((q) => clamp(Math.round(q + jitter(2.4) + (depart ? -3 : 1)), 0, 14));
        return { ...c, count, doorQ };
      }));
      setQueues((qs) => qs.map((q, i) => {
        const d = Math.min(i, 23 - i);
        const base = 16 - d * 1.05;
        return depart
          ? Math.max(0, Math.round(base * 0.35 + jitter(2)))
          : clamp(q + Math.round((base - q) * 0.3 + jitter(2.2) + 1.2), 0, 20);
      }));
      setBoarding((b) => clamp(Math.round(depart ? 168 : b + jitter(14)), 60, 190));
    }, clamp(2200 / speed, 700, 4000));
    return () => clearInterval(id);
  }, [speed]);

  return { blobs, dots, cars, queues, boarding };
}

export default function PlatformMonitor({ tweaks }: { tweaks: { tickSpeed: number; heatIntensity: number } }) {
  const speed = tweaks.tickSpeed ?? 1;
  const { blobs, dots, cars, queues, boarding } = usePlatformData(speed);
  const totalPax = cars.reduce((s, c) => s + c.count, 0) + queues.reduce((a, b) => a + b, 0);
  const crowd = clamp(Math.round((cars.reduce((s, c) => s + c.count / c.cap, 0) / 6) * 100), 0, 100);
  const [next, setNext] = useState(95);
  useEffect(() => {
    const id = setInterval(() => setNext((n) => (n <= 0 ? 110 : n - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(next / 60)).padStart(2, "0");
  const ss = String(next % 60).padStart(2, "0");
  const crowdCol = crowd > 78 ? "var(--red)" : crowd > 55 ? "var(--amber)" : "var(--green)";

  return (
    <div className="view">
      <div className="kpibar">
        <Kpi label="Pax on Platform" val={queues.reduce((a, b) => a + b, 0)} accent="var(--blue)" trend="6%" trendUp />
        <Kpi label="Train Load Index" val={crowd} unit="%" accent={crowdCol} trend="3%" trendUp />
        <Kpi label="Next Departure" val={`${mm}:${ss}`} accent="var(--teal)" />
        <Kpi label="Mean Dwell" val={(42 + (boarding - 112) / 14).toFixed(0)} unit="s" accent="var(--amber)" trend="2s" trendUp={false} />
        <Kpi label="Boarding Flow" val={boarding} unit="pax/min" accent="var(--green)" trend="9%" trendUp />
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-h">
          <span className="ico"><Icon name="layers" size={17} /></span>
          <h2>Platform Density — Bird&#39;s-eye</h2>
          <span className="meta">{totalPax.toLocaleString()} pax tracked · escalators A/B active</span>
        </div>
        <div style={{ padding: 12 }}>
          <PlatformView blobs={blobs} dots={dots} intensity={tweaks.heatIntensity ?? 1} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14, alignItems: "stretch" }} className="pm-lower">
        <div className="panel">
          <div className="panel-h">
            <span className="ico"><Icon name="train" size={17} /></span>
            <h2>Inbound Consist — 6 Cars</h2>
            <span className="meta">Service 4471 · capacity 1,800</span>
          </div>
          <div style={{ padding: 14 }}>
            <TrainDiagram cars={cars} />
            <div className="legend" style={{ marginTop: 14, justifyContent: "center" }}>
              {([["< 55% comfortable", "#33d68a"], ["55–78% busy", "#ffb02e"], ["> 78% crowded", "#ff4d4d"]] as [string, string][]).map(([t, c]) => (
                <div key={t} className="lg"><span className="sw" style={{ background: c }} />{t}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span className="ico"><Icon name="bars" size={17} /></span>
            <h2>Queue Length / Door</h2>
            <span className="meta">D1–24</span>
          </div>
          <div style={{ flex: 1, minHeight: 220, padding: "6px 10px 10px" }}>
            <QueueChart queues={queues} />
          </div>
        </div>
      </div>
    </div>
  );
}
