import React from "react";

interface IconProps {
  name: string;
  size?: number;
  sw?: number;
}

export default function Icon({ name, size = 16, sw = 1.7 }: IconProps) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<string, React.ReactNode> = {
    monitor: <><rect x="2.5" y="5" width="19" height="11" rx="1.5" /><path d="M8 20h8M12 16v4" /></>,
    sim: <><path d="M4 19V5M4 19h16" /><path d="M4 14c4 0 4-7 8-7s4 7 8 7" /></>,
    train: <><rect x="5" y="4" width="14" height="13" rx="3" /><path d="M5 11h14M9 4v7M15 4v7" /><circle cx="8.5" cy="20" r="1" /><circle cx="15.5" cy="20" r="1" /><path d="M7 17l-1.5 2M17 17l1.5 2" /></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5Z" /><path d="M3 13l9 5 9-5" /></>,
    bars: <><path d="M5 21V10M12 21V4M19 21v-7" /></>,
    gauge: <><path d="M12 14l4-4" /><path d="M4 18a8 8 0 1 1 16 0" /><circle cx="12" cy="14" r="1" /></>,
    book: <><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" /><path d="M5 16h13" /></>,
    chevron: <path d="M9 6l6 6-6 6" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 6a3 3 0 0 1 0 6M20.5 20a5.5 5.5 0 0 0-4-5.3" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    bolt: <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8Z" />,
    flow: <><circle cx="6" cy="6" r="2.2" /><circle cx="18" cy="18" r="2.2" /><path d="M6 8.2v3.8a4 4 0 0 0 4 4h5.8" /></>,
    warn: <><path d="M12 3l9.5 16.5h-19L12 3Z" /><path d="M12 10v4M12 17.5v.01" /></>,
    walk: <><circle cx="13" cy="4.5" r="1.6" /><path d="M11 9l2-1 2 3 2 1M11 9l-1.5 4 2 2 .5 4M11 9l-2.5 3" /></>,
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  };

  return <svg {...p}>{paths[name] ?? null}</svg>;
}
