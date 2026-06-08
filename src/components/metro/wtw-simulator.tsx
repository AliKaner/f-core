"use client";

import { useState, useEffect, useRef } from "react";
import Icon from "./icons";
import { Wk, chooseQueue, clamp, lerp, randn, CALIB } from "./model";

type CalibParams = typeof CALIB;

function ArcGauge({ value, label, size = 150 }: { value: number; label: string; size?: number }) {
  const r = size / 2 - 16, cx = size / 2, cy = r + 14;
  const svgH = cy + 14;
  const ang = (v: number) => Math.PI - Math.PI * (clamp(v, 0, 100) / 100);
  const pt = (a: number): [number, number] => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const col = value > 66 ? "var(--green)" : value > 38 ? "var(--amber)" : "var(--red)";
  const trk = (() => { const [x0, y0] = pt(Math.PI), [x1, y1] = pt(0); return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`; })();
  const val = (() => { const [x0, y0] = pt(Math.PI), [x1, y1] = pt(ang(value)); return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`; })();
  const [px, py] = pt(ang(value));
  return (
    <div className="gauge-card" style={{ position: "relative", width: size }}>
      <svg width={size} height={svgH} style={{ display: "block" }}>
        <path d={trk} fill="none" stroke="rgba(120,160,200,.15)" strokeWidth="10" strokeLinecap="round" />
        <path d={val} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round" style={{ transition: "all .6s ease", filter: `drop-shadow(0 0 7px ${col})` }} />
        {[0, 25, 50, 75, 100].map((tick) => {
          const a = ang(tick);
          const [ox, oy] = [cx + (r + 8) * Math.cos(a), cy - (r + 8) * Math.sin(a)];
          const [ix, iy] = [cx + (r - 8) * Math.cos(a), cy - (r - 8) * Math.sin(a)];
          return <line key={tick} x1={ox} y1={oy} x2={ix} y2={iy} stroke="rgba(120,160,200,.4)" strokeWidth="1.4" />;
        })}
        <circle cx={px} cy={py} r="5.5" fill={col} stroke="var(--panel)" strokeWidth="2.5" style={{ transition: "all .6s ease", filter: `drop-shadow(0 0 5px ${col})` }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 30, textAlign: "center", pointerEvents: "none" }}>
        <div className="gauge-val" style={{ color: col }}>{Math.round(value)}</div>
        <div className="gauge-cap" style={{ marginTop: 2 }}>{label}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: size - 14, fontFamily: "var(--fs-mono)", fontSize: 9, color: "var(--muted-2)", marginTop: -2 }}>
        <span>0</span><span>100</span>
      </div>
    </div>
  );
}

function WkChart({ meanK, frontierW }: { lambda: number; meanK: number; frontierW: number }) {
  const W = 320, H = 200, pl = 38, pb = 26, pt = 14, pr = 12;
  const iw = W - pl - pr, ih = H - pt - pb;
  const kMax = 6, yMin = 60, yMax = 94;
  const xs = (k: number) => pl + (k / kMax) * iw;
  const ys = (w: number) => pt + (1 - (w - yMin) / (yMax - yMin)) * ih;
  const pts: [number, number][] = [];
  for (let k = 0; k <= kMax + 0.001; k += 0.12) pts.push([xs(k), ys(Wk(k))]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L ${xs(kMax)} ${ys(yMin)} L ${xs(0)} ${ys(yMin)} Z`;
  const mW = Wk(meanK);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(46,155,255,.30)" /><stop offset="1" stopColor="rgba(46,155,255,0)" />
        </linearGradient>
      </defs>
      {[60, 68, 76, 84, 92].map((w) => (
        <g key={w}>
          <line x1={pl} y1={ys(w)} x2={W - pr} y2={ys(w)} stroke="rgba(120,160,200,.1)" />
          <text x={pl - 6} y={ys(w) + 3} fontSize="9" fill="var(--muted-2)" textAnchor="end" fontFamily="var(--fs-mono)">{w}</text>
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <text key={k} x={xs(k)} y={H - 8} fontSize="9" fill="var(--muted-2)" textAnchor="middle" fontFamily="var(--fs-mono)">{k}</text>
      ))}
      <text x={W / 2} y={H - 0.5} fontSize="8.5" fill="var(--muted)" textAnchor="middle" fontFamily="var(--fs-mono)" letterSpacing=".5">k  (walk-effort index)</text>
      <path d={area} fill="url(#wgrad)" />
      <path d={line} fill="none" stroke="var(--blue)" strokeWidth="2.4" style={{ filter: "drop-shadow(0 0 4px rgba(46,155,255,.5))" }} />
      <line x1={pl} y1={ys(frontierW)} x2={W - pr} y2={ys(frontierW)} stroke="var(--teal)" strokeWidth="1.3" strokeDasharray="4 3" style={{ transition: "all .5s" }} />
      <text x={W - pr} y={ys(frontierW) - 5} fontSize="9" fill="var(--teal)" textAnchor="end" fontFamily="var(--fs-mono)">W̄={frontierW.toFixed(1)}</text>
      <line x1={xs(meanK)} y1={pt} x2={xs(meanK)} y2={ys(yMin)} stroke="rgba(255,176,46,.4)" strokeWidth="1.2" style={{ transition: "all .5s" }} />
      <circle cx={xs(meanK)} cy={ys(mW)} r="4.5" fill="var(--amber)" style={{ transition: "all .5s", filter: "drop-shadow(0 0 5px var(--amber))" }} />
    </svg>
  );
}

function DistDiagram({ q, frontier, dd, lambda }: { q: number[]; frontier: number; dd: number; lambda: number }) {
  const n = q.length, maxQ = Math.max(8, ...q);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 150, padding: "0 4px" }}>
        {q.map((v, i) => {
          const reachable = i < frontier;
          const h = clamp(v / maxQ, 0.03, 1) * 100;
          const col = !reachable ? "rgba(120,160,200,.22)" : v > maxQ * 0.7 ? "var(--red)" : v > maxQ * 0.42 ? "var(--amber)" : "var(--teal)";
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0 }}>
              <span style={{ fontFamily: "var(--fs-mono)", fontSize: 9, color: reachable ? "var(--text)" : "var(--muted-2)", marginBottom: 3 }}>{v}</span>
              <div style={{ width: "100%", height: `${h}%`, background: col, borderRadius: "3px 3px 0 0", transition: "height .5s ease,background .4s", boxShadow: reachable && v > maxQ * 0.7 ? "0 0 7px rgba(255,77,77,.5)" : "none" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 3, padding: "5px 4px 0", borderTop: "1px solid var(--line)" }}>
        {q.map((_, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: "var(--fs-mono)", fontSize: 8, color: i + 1 === frontier ? "var(--blue)" : "var(--muted-2)", minWidth: 0 }}>
            {(i + 1) % 3 === 1 ? i + 1 : ""}
          </div>
        ))}
      </div>
      {frontier < n && (
        <div style={{ position: "absolute", top: -4, bottom: 22, left: `${(frontier / n) * 100}%`, width: 0, borderLeft: "1.5px dashed var(--blue)" }}>
          <div style={{ position: "absolute", top: -2, left: 4, fontFamily: "var(--fs-mono)", fontSize: 9, color: "var(--blue)", whiteSpace: "nowrap" }}>N*={frontier}</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontFamily: "var(--fs-mono)", fontSize: 9.5, color: "var(--muted)" }}>
        <span>◀ ESC A · queue 1 (nearest)</span>
        <span>queue {n} (farthest) ▶</span>
      </div>
      {/* suppress unused prop warning */}
      <span style={{ display: "none" }}>{dd}{lambda}</span>
    </div>
  );
}

function Frac({ top, bot }: { top: React.ReactNode; bot: React.ReactNode }) {
  return <span className="frac"><span className="top">{top}</span><span className="bot">{bot}</span></span>;
}

function InfoTooltip({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span 
      style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help", marginLeft: "6px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ color: "var(--muted-2)", display: "inline-flex", opacity: 0.85 }}>
        <Icon name="info" size={12} />
      </span>
      {hovered && (
        <span style={{
          position: "absolute",
          top: "100%",
          left: "auto",
          right: "0",
          marginTop: "6px",
          background: "#0c1c2d",
          border: "1px solid var(--blue)",
          color: "var(--text)",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "11px",
          width: "240px",
          lineHeight: "1.4",
          boxShadow: "0 6px 16px rgba(0,0,0,0.6)",
          zIndex: 9999,
          pointerEvents: "none",
          fontWeight: "normal",
          fontFamily: "var(--fs-sans)",
          textAlign: "left",
          whiteSpace: "normal"
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

function FormulaCard({ tag, title, children, calib, info }: { tag: string; title: string; children: React.ReactNode; calib?: string; info?: string }) {
  return (
    <div className="formula-card">
      <div className="fc-h" style={{ display: "flex", alignItems: "center" }}>
        <span className="fc-tag">{tag}</span>
        <span className="fc-title" style={{ display: "inline-flex", alignItems: "center" }}>
          {title}
          {info && <InfoTooltip text={info} />}
        </span>
      </div>
      <div className="math">{children}</div>
      {calib && <div className="calibchip">{calib}</div>}
    </div>
  );
}

function ModelReference({ open, onToggle, params }: { open: boolean; onToggle: () => void; params: CalibParams }) {
  return (
    <div className="panel modelref" style={{ width: open ? 366 : 52, flex: "0 0 auto", transition: "width .3s ease", overflow: "hidden" }}>
      <div className="panel-h" style={{ cursor: "pointer", padding: open ? "12px 16px" : "12px 0", justifyContent: "center" }} onClick={onToggle}>
        {open ? (
          <>
            <span className="ico"><Icon name="book" size={17} /></span>
            <h2>Model Reference</h2>
            <button className="collapse-btn" style={{ marginLeft: "auto", transform: "none" }}>
              <Icon name="chevron" size={15} />
            </button>
          </>
        ) : (
          <span className="ico" style={{ display: "grid", placeItems: "center", color: "var(--blue)" }} title="Expand Model Reference">
            <Icon name="book" size={17} />
          </span>
        )}
      </div>
      {open && (
        <div style={{ padding: 14, overflow: "auto" }}>
          <FormulaCard 
            tag="A2" 
            title="Decision rule"
            info="Passenger chooses walking if willingness-to-walk is greater than distance penalty and queue length cost."
          >
            If <span className="fn">W</span>(<span className="var">k</span>) <span className="op">≥</span> <span className="var">d</span><sub>n</sub> <span className="op">+</span> <span className="var">λ</span><span className="op">·</span><span className="var">q</span><sub>n</sub> &nbsp;→&nbsp; walk to queue&nbsp;<span className="var">n</span><br />
            <span style={{ color: "var(--muted)" }}>otherwise</span> &nbsp;→&nbsp; stay in queue&nbsp;<span className="num">1</span>
          </FormulaCard>

          <FormulaCard 
            tag="SEL" 
            title="Queue selection"
            info="Selects the highest queue index n where willingness-to-walk outweighs combined cost. Falls back to queue 1 if none."
          >
            <span className="var">N</span> <span className="op">=</span> <span className="num">1</span>&nbsp;&nbsp;<span style={{ color: "var(--muted)" }}>if</span>&nbsp; <span className="fn">W</span>(<span className="var">k</span>) <span className="op">≤</span> <span className="var">d</span><sub>1</sub><span className="op">+</span><span className="var">λq</span><sub>1</sub><br />
            <span className="var">N</span> <span className="op">=</span> max&#123;<span className="var">n</span><span className="op">=</span>2…<span className="var">n̂</span> <span className="op">|</span> <span className="fn">W</span>(<span className="var">k</span>) <span className="op">&gt;</span> <span className="var">d</span><sub>n</sub><span className="op">+</span><span className="var">λq</span><sub>n</sub>&#125;<br />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>where&nbsp;</span><span className="var">d</span><sub>n</sub> <span className="op">=</span> <span className="var">Δd</span><span className="op">·</span>(<span className="var">n</span><span className="op">−</span><span className="num">1</span>)
          </FormulaCard>

          <FormulaCard 
            tag="WLSM" 
            title="Sigmoid willingness-to-walk" 
            calib={`θ = [${params.t1}, ${params.t2}, ${params.t3}, ${params.t4}]  ·  WLSM best-fit`}
            info="Models decline in willingness-to-walk as platform distance index k increases. Calibrated via WLS method."
          >
            <span className="fn">W</span>(<span className="var">k</span>) <span className="op">=</span> <span className="var">θ</span><sub>1</sub> <span className="op">+</span> <Frac top={<span><span className="var">θ</span><sub>2</sub></span>} bot={<span><span className="num">1</span><span className="op">+</span><span className="var">θ</span><sub>3</sub><span className="op">·</span><span className="fn">e</span><sup><span className="op">−</span><span className="var">θ</span><sub>4</sub><span className="var">k</span></sup></span>} />
            <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--green)" }}>
              <span className="fn">W</span>(<span className="var">k</span>) <span className="op">=</span> <span className="num">68.41</span> <span className="op">+</span> <Frac top={<span className="num">22.61</span>} bot={<span><span className="num">1</span><span className="op">+</span><span className="num">71.63</span><span className="op">·</span><span className="fn">e</span><sup><span className="op">−</span><span className="num">1.13</span><span className="var">k</span></sup></span>} />
            </div>
          </FormulaCard>

          <FormulaCard 
            tag="IVM" 
            title="In-vehicle movement probability"
            info="Logistic distribution modeling passenger moves between carriages to balance densities."
          >
            <span className="fn">p</span>(<span className="var">i,j</span>) <span className="op">=</span> <Frac top={<span><span className="fn">e</span><sup><span className="var">b</span><span className="op">+</span><span className="var">a</span><span className="op">·</span><span className="var">x</span><sub>ij</sub></sup></span>} bot={<span><span className="num">1</span><span className="op">+</span><span className="fn">e</span><sup><span className="var">b</span><span className="op">+</span><span className="var">a</span><span className="op">·</span><span className="var">x</span><sub>ij</sub></sup></span>} />
          </FormulaCard>

          <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <span className="ico" style={{ color: "var(--teal)", display: "grid", placeItems: "center" }}><Icon name="info" size={14} /></span>
              <h3 style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--teal)" }}>Model Glossary</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", paddingRight: "4px" }}>
              {[
                { sym: "k", name: "Walk-Effort Index", desc: "Relative walking effort required along the platform." },
                { sym: "W(k)", name: "Willingness-to-Walk", desc: "Percentage probability that a passenger decides to walk farther to avoid queues." },
                { sym: "λ (Lambda)", name: "Queue Aversion", desc: "Delay sensitivity weight. Higher values cause passengers to walk more to bypass queues." },
                { sym: "d_n", name: "Distance Penalty", desc: "Physical distance from the escalator to queue n: d_n = Δd · (n - 1)." },
                { sym: "q_n", name: "Queue Length", desc: "Live passenger count queued at boarding door n." },
                { sym: "p(i,j)", name: "Movement Probability", desc: "Probability of internal transit from carriage i to carriage j based on density." }
              ].map((item, index) => (
                <div key={index} style={{ background: "var(--bg-deep)", border: "1px solid var(--line)", borderRadius: "6px", padding: "8px", fontSize: "11px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontFamily: "var(--fs-mono)" }}>
                    <span style={{ color: "var(--blue)", fontWeight: "bold", fontSize: "12px" }}>{item.sym}</span>
                    <span style={{ color: "var(--text)", fontWeight: "500" }}>— {item.name}</span>
                  </div>
                  <div style={{ color: "var(--muted)", lineHeight: "1.4" }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SliderProps { sym?: string; name: string; value: string | number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void; hint?: string; }
function Slider({ sym, name, value, min, max, step, unit, onChange, hint }: SliderProps) {
  return (
    <div className="ctrl">
      <div className="ctrl-top">
        <span className="ctrl-name">{sym && <span className="sym">{sym}</span>}{name}</span>
        <span className="ctrl-val">{value}{unit && <small>{unit}</small>}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={Number(value)} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <div className="scale"><span>{min}</span><span>{max}</span></div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function useWtwSim({ lambda, arrival, nhat, dd, speed, isPaused, paxArrivalEnabled }: { lambda: number; arrival: number; nhat: number; dd: number; speed: number; isPaused: boolean; paxArrivalEnabled: boolean }) {
  const [q, setQ] = useState<number[]>(() => Array(nhat).fill(0));
  const [meanK, setMeanK] = useState(2.6);
  const tickRef = useRef(0);

  const [prevNhat, setPrevNhat] = useState(nhat);

  if (nhat !== prevNhat) {
    setPrevNhat(nhat);
    setQ((prev) => {
      const a = Array(nhat).fill(0);
      for (let i = 0; i < Math.min(nhat, prev.length); i++) a[i] = prev[i];
      return a;
    });
  }

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      tickRef.current++;
      const board = tickRef.current % 8 === 0;
      setQ((prev) => {
        let q2 = prev.slice(0, nhat);
        while (q2.length < nhat) q2.push(0);
        if (board) q2 = q2.map((v) => Math.max(0, v - 6));
        
        const arrivals = paxArrivalEnabled ? Math.max(1, Math.round(arrival / 4)) : 0;
        let ksum = 0;
        if (arrivals > 0) {
          for (let a = 0; a < arrivals; a++) {
            const k = clamp(2.7 + randn() * 1.5, 0, 6);
            ksum += k;
            const W = Wk(k);
            const N = chooseQueue(W, lambda, dd, q2, nhat);
            q2[N - 1] = (q2[N - 1] || 0) + 1;
          }
          setMeanK((m) => lerp(m, ksum / arrivals, 0.4));
        }
        return q2.map((v) => Math.round(v));
      });
    }, clamp(1100 / speed, 450, 2400));
    return () => clearInterval(id);
  }, [lambda, arrival, nhat, dd, speed, isPaused, paxArrivalEnabled]);

  return { q, meanK };
}

interface SimKpiProps { label: string; val: string | number; unit?: string; accent: string; sub?: string; }
function SimKpi({ label, val, unit, accent, sub }: SimKpiProps) {
  return (
    <div className="kpi" style={{ padding: "12px 15px" }}>
      <span className="accent" style={{ background: accent }} />
      <div className="label">{label}</div>
      <div className="val" style={{ fontSize: 23 }}>{val}{unit && <small>{unit}</small>}</div>
      {sub && <div style={{ fontFamily: "var(--fs-mono)", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function WtwSimulator({ tweaks }: { tweaks: { tickSpeed: number; heatIntensity: number; isPaused: boolean; paxArrivalEnabled: boolean } }) {
  const [lambda, setLambda] = useState(1.0);
  const [arrival, setArrival] = useState(34);
  const [nhat, setNhat] = useState(20);
  const [dd, setDd] = useState(3.0);
  const [refOpen, setRefOpen] = useState(true);
  const [preset, setPreset] = useState("peak");
  const speed = tweaks.tickSpeed ?? 1;
  const { q, meanK } = useWtwSim({ lambda, arrival, nhat, dd, speed, isPaused: tweaks.isPaused, paxArrivalEnabled: tweaks.paxArrivalEnabled });

  const applyPreset = (p: string) => {
    setPreset(p);
    if (p === "calm") { setLambda(0.5); setArrival(14); setNhat(20); setDd(3); }
    if (p === "peak") { setLambda(1.0); setArrival(34); setNhat(20); setDd(3); }
    if (p === "surge") { setLambda(2.1); setArrival(68); setNhat(24); setDd(3.5); }
  };

  const meanW = Wk(meanK);
  const frontier = chooseQueue(meanW, lambda, dd, q, nhat);
  const total = q.reduce((a, b) => a + b, 0) || 1;
  const meanWalk = q.reduce((s, v, i) => s + v * dd * i, 0) / total;
  const mean = total / nhat;
  const cv = Math.sqrt(q.reduce((s, v) => s + (v - mean) ** 2, 0) / nhat) / (mean || 1);
  const balance = clamp(1 - cv / 1.4, 0, 1);
  const reach = frontier / nhat;
  const wtwScore = clamp(Math.round((0.55 * reach + 0.45 * balance) * 100), 0, 100);

  return (
    <div className="view">
      <div style={{ display: "grid", gridTemplateColumns: "200px repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
        <div className="panel" style={{ alignItems: "center", justifyContent: "center", padding: "10px 0 14px" }}>
          <ArcGauge value={wtwScore} label="WTW Score" />
        </div>
        <SimKpi label="Reachable Frontier" val={`N*=${frontier}`} accent="var(--blue)" sub={`of ${nhat} queues`} />
        <SimKpi label="Mean Walk Dist" val={meanWalk.toFixed(1)} unit="m" accent="var(--teal)" sub={`Δd=${dd}m · k̄=${meanK.toFixed(2)}`} />
        <SimKpi label="Distribution Balance" val={Math.round(balance * 100)} unit="%" accent={balance > 0.6 ? "var(--green)" : "var(--amber)"} sub={`CV=${cv.toFixed(2)}`} />
        <SimKpi label="Mean Willingness" val={meanW.toFixed(1)} accent="var(--amber)" sub={`W̄ at k̄`} />
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }} className="sim-main">
        <div className="panel" style={{ flex: "0 0 296px" }}>
          <div className="panel-h"><span className="ico"><Icon name="bolt" size={17} /></span><h2>Parameters</h2></div>
          <div style={{ padding: 16 }}>
            <div className="presetrow" style={{ marginBottom: 18 }}>
              {([["calm", "Off-peak"], ["peak", "AM Peak"], ["surge", "Surge"]] as [string, string][]).map(([k, t]) => (
                <button key={k} className={"preset" + (preset === k ? " on" : "")} onClick={() => applyPreset(k)}>{t}</button>
              ))}
            </div>
            <Slider sym="λ" name="Queue aversion" value={lambda.toFixed(1)} min={0} max={3} step={0.1} onChange={(v) => { setLambda(v); setPreset(""); }} hint="Weight on queue length vs. walking distance. Higher λ → passengers refuse to walk to long queues." />
            <Slider name="Arrival rate" value={arrival} min={5} max={80} step={1} unit=" pax/min" onChange={(v) => { setArrival(v); setPreset(""); }} hint="Inflow from escalators A + B onto the platform." />
            <Slider sym="n̂" name="Number of queues" value={nhat} min={6} max={24} step={1} onChange={(v) => { setNhat(v); setPreset(""); }} hint="Active boarding doors along the platform." />
            <Slider sym="Δd" name="Door spacing" value={dd.toFixed(1)} min={1} max={6} step={0.5} unit=" m" onChange={(v) => { setDd(v); setPreset(""); }} hint="Distance penalty between adjacent queues, dₙ=Δd·(n−1)." />
            <div className="legend" style={{ marginTop: 6 }}>
              {([["reachable", "var(--teal)"], ["congested", "var(--red)"], ["unreached", "rgba(120,160,200,.4)"]] as [string, string][]).map(([t, c]) => (
                <div key={t} className="lg"><span className="sw" style={{ background: c }} />{t}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div className="panel">
            <div className="panel-h">
              <span className="ico"><Icon name="sim" size={17} /></span>
              <h2>Willingness-to-Walk Curve · W(k)</h2>
              <span className="meta">sigmoid · WLSM-calibrated</span>
            </div>
            <div style={{ padding: "10px 14px 4px" }}>
              <WkChart lambda={lambda} meanK={meanK} frontierW={meanW} />
            </div>
          </div>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-h">
              <span className="ico"><Icon name="people" size={17} /></span>
              <h2>Live Platform Distribution</h2>
              <span className="meta">{total} pax queued · N*={frontier}</span>
            </div>
            <div style={{ padding: 16 }}>
              <DistDiagram q={q} frontier={frontier} dd={dd} lambda={lambda} />
            </div>
          </div>
        </div>

        <ModelReference open={refOpen} onToggle={() => setRefOpen((o) => !o)} params={CALIB} />
      </div>
    </div>
  );
}
