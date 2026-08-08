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
export const IconBank = (p: P) => (
  <svg {...base} {...p}><path d="M3 10l9-6 9 6" /><path d="M4 10h16v1H4z" /><path d="M5 11v8M9.5 11v8M14.5 11v8M19 11v8" /><path d="M3 21h18" /></svg>
);
export const IconSwap = (p: P) => (
  <svg {...base} {...p}><path d="M4 8h13l-3-3M17 16H4l3 3" /></svg>
);
export const IconShip = (p: P) => (
  <svg {...base} {...p}><path d="M5 11V5h6l2 3h4v3" /><path d="M3 14h18l-2 5H5l-2-5z" /><path d="M9 5V3M9 8h2" /></svg>
);
export const IconTrending = (p: P) => (
  <svg {...base} {...p}><path d="M4 20V10M9 20V13M14 20V7M19 20V4" /><path d="M13 5l6-1.5.5 6" /></svg>
);
export const IconGlobeTech = (p: P) => (
  <svg {...base} {...p}><circle cx="10" cy="11" r="7" /><path d="M3 11h14M10 4c2 2 3 4.3 3 7s-1 5-3 7c-2-2-3-4.3-3-7s1-5 3-7z" /><circle cx="18" cy="18" r="3.2" /><path d="M18 15.3v.9M18 19.8v.9M20.7 18h-.9M15.9 18h-.9M20 16l-.6.6M16.6 19.4l-.6.6M20 20l-.6-.6M16.6 16.6l-.6-.6" /></svg>
);
export const IconCertificate = (p: P) => (
  <svg {...base} {...p}><path d="M6 3h9l3 3v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M8 8h6M8 11h6" /><circle cx="9.5" cy="17.5" r="2.5" /><path d="M8 19.5L7 22l2.5-1 2.5 1-1-2.5" /></svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M8 14h2M14 14h2M8 17h2M14 17h2" /></svg>
);
export const IconPlane = (p: P) => (
  <svg {...base} {...p}><path d="M10.5 20.5l1.5-4.5 6-3.5-1-2-6.5 1.5L7 9 4.5 10l2.5 3.5-1 4 1.5-.5 1-2.5 2 2z" /></svg>
);
export const IconMonitor = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></svg>
);
export const IconMail = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 6.5l8 6 8-6" /></svg>
);
export const IconBriefcase = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></svg>
);
export const IconPeople = (p: P) => (
  <svg {...base} {...p}><circle cx="8.5" cy="8" r="3" /><path d="M2.5 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="8.5" r="2.4" /><path d="M15.2 14.3c2.6.4 4.6 2.6 4.6 5.7" /></svg>
);
export const IconMegaphone = (p: P) => (
  <svg {...base} {...p}><path d="M3 10v4h3l6 4V6l-6 4H3z" /><path d="M14 9a3 3 0 0 1 0 6M17 6a6 6 0 0 1 0 12" /></svg>
);
export const IconSeal = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="9" r="6" /><path d="M9 14.5L7.5 21l4.5-2 4.5 2-1.5-6.5" /><path d="M9.5 9l1.7 1.7L14.5 7" /></svg>
);
export const IconIdCard = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="11" r="2" /><path d="M6 16.5c.4-1.5 1.3-2.3 2.5-2.3s2.1.8 2.5 2.3" /><path d="M14 10h4M14 13h4" /></svg>
);
export const IconShieldCheck = (p: P) => (
  <svg {...base} {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const IconLeaf = (p: P) => (
  <svg {...base} {...p}><path d="M5 19c-1-6 2-13 14-14-1 12-8 15-14 14z" /><path d="M5 19c2-5 5-8 10-10" /></svg>
);
export const IconClock = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
);
export const IconUser = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
);
export const IconLock = (p: P) => (
  <svg {...base} {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
export const IconEye = (p: P) => (
  <svg {...base} {...p}><path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconEyeOff = (p: P) => (
  <svg {...base} {...p}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.4 10.4 0 0 1 12 5c6.2 0 10 7 10 7a17.7 17.7 0 0 1-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s3.8 7 10 7c1.5 0 2.8-.4 4-1" /><path d="M9.5 9.8a3 3 0 0 0 4.2 4.2" /></svg>
);
export const IconArrowRight = (p: P) => (
  <svg {...base} {...p}><path d="M4 12h16M13 5l7 7-7 7" /></svg>
);
export const IconQuestion = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.2 9.5a2.8 2.8 0 1 1 4.4 2.3c-.9.7-1.6 1.2-1.6 2.4" /><path d="M12 17.3v.1" /></svg>
);
export const IconTicket = (p: P) => (
  <svg {...base} {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" /><path d="M10 6v2M10 11v2M10 16v2" /></svg>
);
export const IconTie = (p: P) => (
  <svg {...base} {...p}><path d="M9 4h6l1 3-2 2 2 10-4 3-4-3 2-10-2-2 1-3z" /><path d="M9 4a3 3 0 0 0 6 0" /></svg>
);
export const IconBuilding = (p: P) => (
  <svg {...base} {...p}><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" /><path d="M10 21v-4h4v4" /></svg>
);
export const IconPhone = (p: P) => (
  <svg {...base} {...p}><path d="M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5V19a2 2 0 0 1-2 2C10.5 21 3 13.5 3 6a2 2 0 0 1 2-2z" /></svg>
);
export const IconBell = (p: P) => (
  <svg {...base} {...p}><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const IconChevronDown = (p: P) => (
  <svg {...base} {...p}><path d="M5 8l7 7 7-7" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>
);
export const IconLogout = (p: P) => (
  <svg {...base} {...p}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M15 16l4-4-4-4M19 12H9" /></svg>
);
export const IconUserPlus = (p: P) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="4" /><path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /><path d="M19 8v6M16 11h6" /></svg>
);
export const IconEdit = (p: P) => (
  <svg {...base} {...p}><path d="M4 20h4L18.5 9.5a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L4 15v5z" /><path d="M13.5 6.5l2.5 2.5" /></svg>
);
export const IconClipboard = (p: P) => (
  <svg {...base} {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V4z" /><path d="M8.5 13l2 2 4-4" /></svg>
);
export const IconCreditCard = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></svg>
);
export const IconHeadset = (p: P) => (
  <svg {...base} {...p}><path d="M4 13a8 8 0 0 1 16 0" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /><path d="M19 19v1a3 3 0 0 1-3 3h-3" /></svg>
);
export const IconFolder = (p: P) => (
  <svg {...base} {...p}><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" /></svg>
);
export const IconSettings = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
);
export const IconClose = (p: P) => (
  <svg {...base} {...p}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
export const IconGrid = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
);
export const IconStar = (p: P) => (
  <svg {...base} {...p}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base} {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-5-5" /></svg>
);
export const IconDownload = (p: P) => (
  <svg {...base} {...p}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 19h16" /></svg>
);
export const IconFilter = (p: P) => (
  <svg {...base} {...p}><path d="M4 5h16M7 12h10M10 19h4" /></svg>
);
export const IconDots = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></svg>
);
export const IconChevronLeft = (p: P) => (
  <svg {...base} {...p}><path d="M15 5l-7 7 7 7" /></svg>
);
export const IconChevronRight = (p: P) => (
  <svg {...base} {...p}><path d="M9 5l7 7-7 7" /></svg>
);
export const IconPlus = (p: P) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconXCircle = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
);
export const IconMenu = (p: P) => (
  <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const IconInstagram = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" /></svg>
);
export const IconFacebook = (p: P) => (
  <svg {...base} {...p}><path d="M15 4h-2.5A3.5 3.5 0 0 0 9 7.5V10H6.5v3.5H9V21h3.5v-7.5h2.6l.4-3.5h-3V7.8c0-.9.3-1.3 1.3-1.3H15V4z" /></svg>
);
export const IconLinkedin = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="7.7" cy="8.2" r="1" fill="currentColor" stroke="none" /><path d="M7.7 11v7" /><path d="M12 18v-4.2c0-1.7 1-2.8 2.5-2.8 1.4 0 2 1 2 2.8V18M12 11v7" /></svg>
);
export const IconWhatsapp = (p: P) => (
  <svg {...base} {...p}><path d="M6 19l1.2-3.5A7.5 7.5 0 1 1 10 18.3L6 19z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5.8-1l-.4-1a.8.8 0 0 0-1-.5l-.7.3a4.4 4.4 0 0 1-2.5-2.5l.3-.7a.8.8 0 0 0-.5-1l-1-.4c-.5-.2-1 .2-1 .8z" /></svg>
);

const map = {
  handshake: IconHandshake,
  chart: IconChart,
  globe: IconGlobe,
  scale: IconScale,
  laurel: IconLaurel,
  pin: IconPin,
  network: IconNetwork,
  bank: IconBank,
  swap: IconSwap,
  ship: IconShip,
  trending: IconTrending,
  globetech: IconGlobeTech,
  certificate: IconCertificate,
  calendar: IconCalendar,
  plane: IconPlane,
  monitor: IconMonitor,
  mail: IconMail,
  briefcase: IconBriefcase,
  people: IconPeople,
  megaphone: IconMegaphone,
  seal: IconSeal,
  idcard: IconIdCard,
  shieldcheck: IconShieldCheck,
  leaf: IconLeaf,
  clock: IconClock,
  user: IconUser,
  lock: IconLock,
  eye: IconEye,
  eyeoff: IconEyeOff,
  arrowright: IconArrowRight,
  question: IconQuestion,
  ticket: IconTicket,
  tie: IconTie,
  building: IconBuilding,
  phone: IconPhone,
  bell: IconBell,
  chevrondown: IconChevronDown,
  check: IconCheck,
  logout: IconLogout,
  userplus: IconUserPlus,
  edit: IconEdit,
  clipboard: IconClipboard,
  creditcard: IconCreditCard,
  headset: IconHeadset,
  folder: IconFolder,
  settings: IconSettings,
  close: IconClose,
  grid: IconGrid,
  star: IconStar,
  search: IconSearch,
  download: IconDownload,
  filter: IconFilter,
  dots: IconDots,
  chevronleft: IconChevronLeft,
  chevronright: IconChevronRight,
  plus: IconPlus,
  xcircle: IconXCircle,
  menu: IconMenu,
  instagram: IconInstagram,
  facebook: IconFacebook,
  linkedin: IconLinkedin,
  whatsapp: IconWhatsapp,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name as keyof typeof map] ?? IconGlobe;
  return <C className={className} />;
}
