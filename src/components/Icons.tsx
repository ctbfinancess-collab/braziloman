/** Ícones em linha (stroke = currentColor) usados nos pilares e na tarja. */
type P = { className?: string };

const base = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconHandshake = (p: P) => (
  <svg {...base} {...p}><path d="M11 17l2 2a1.4 1.4 0 0 0 2 0 1.4 1.4 0 0 0 0-2M13 19a1.4 1.4 0 0 0 2 0 1.4 1.4 0 0 0 0-2l-.5-.5" /><path d="M15 17l1.5 1.5a1.4 1.4 0 0 0 2-2L14 12l-2 2a1.4 1.4 0 0 1-2-2l3-3H8l-3 2M3 8l3 6M18 8l3 6M17 8l-3-3H9" /></svg>
);
export const IconChart = (p: P) => (
  <svg {...base} {...p}><path d="M4 20V4M4 20h16" /><path d="M8 16v-3M12 16V9M16 16v-6M20 16v-9" /></svg>
);
export const IconGlobe = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z" /></svg>
);
export const IconScale = (p: P) => (
  <svg {...base} {...p}><path d="M12 4v16M7 20h10M4 8h16M8 4h8" /><path d="M4 8l-2.2 5a2.2 2.2 0 0 0 4.4 0L4 8zM20 8l-2.2 5a2.2 2.2 0 0 0 4.4 0L20 8z" /></svg>
);
export const IconLaurel = (p: P) => (
  <svg {...base} {...p}><path d="M12 21V8" /><path d="M12 20c-3 0-5.5-2-6-5 2.6-.2 4.8 1 6 3M12 20c3 0 5.5-2 6-5-2.6-.2-4.8 1-6 3M12 15c-2.5 0-4.6-1.7-5-4.5 2.2-.2 4 .9 5 2.7M12 15c2.5 0 4.6-1.7 5-4.5-2.2-.2-4 .9-5 2.7M12 10c-2 0-3.7-1.4-4-3.6 1.8-.2 3.2.8 4 2.3M12 10c2 0 3.7-1.4 4-3.6-1.8-.2-3.2.8-4 2.3" /></svg>
);
export const IconPin = (p: P) => (
  <svg {...base} {...p}><path d="M12 22s7-6.3 7-12A7 7 0 0 0 5 10c0 5.7 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const IconNetwork = (p: P) => (
  <svg {...base} {...p}><circle cx="6" cy="7" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="12" cy="18" r="2" /><path d="M8 8l3 8M16 8l-3 8M8 7h8" /></svg>
);

const map = {
  handshake: IconHandshake,
  chart: IconChart,
  globe: IconGlobe,
  scale: IconScale,
  laurel: IconLaurel,
  pin: IconPin,
  network: IconNetwork,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name as keyof typeof map] ?? IconGlobe;
  return <C className={className} />;
}
