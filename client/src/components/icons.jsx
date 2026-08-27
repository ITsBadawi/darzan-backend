// Small line-icon set. Kept as plain SVG (no external icon package) so it
// ports cleanly to react-native-svg later — same `d` paths, different tags.

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
)
export const HeartIcon = (p) => (
  <svg {...base} {...p}><path d="M12 21s-7-4.6-9.5-9C1 8.5 2.5 5 6 5c2 0 3.3 1 4 2.2C10.7 6 12 5 14 5c3.5 0 5 3.5 3.5 7-2.5 4.4-9.5 9-9.5 9z" /></svg>
)
export const CartIcon = (p) => (
  <svg {...base} {...p}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
)
export const HomeIcon = (p) => (
  <svg {...base} {...p}><path d="M4 11l8-7 8 7v9H4v-9z" /></svg>
)
export const GridIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></svg>
)
export const TruckIcon = (p) => (
  <svg {...base} {...p}><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>
)
export const CashIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M3 11h18" /></svg>
)
export const ChatIcon = (p) => (
  <svg {...base} {...p}><path d="M21 11.5a8.5 8.5 0 1 1-4-7.2" /><path d="M21 3l-6 6" /></svg>
)
export const WhatsAppIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.4-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.3-.6-.4z" />
  </svg>
)
export const PlayIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z" /></svg>
)
export const CheckIcon = (p) => (
  <svg {...base} strokeWidth={2.5} {...p}><path d="M20 6L9 17l-5-5" /></svg>
)
export const FilterIcon = (p) => (
  <svg {...base} {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
)
export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

// product "watermark" illustrations, keyed by category icon type
export const JacketIcon = (p) => (
  <svg {...base} {...p}><path d="M8 4l4 2 4-2 3 4-3 2v10H5V10L2 8l3-4z" /></svg>
)
export const DressIcon = (p) => (
  <svg {...base} {...p}><path d="M12 3l-3 4 3 3 3-3-3-4z" /><path d="M6 21l3-11h6l3 11H6z" /></svg>
)
export const AbayaIcon = (p) => (
  <svg {...base} {...p}><path d="M12 4c-3 3-6 4-6 8a6 6 0 0 0 12 0c0-4-3-5-6-8z" /></svg>
)
export const ChildIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="7" r="3" /><path d="M7 21v-5a5 5 0 0 1 10 0v5" /></svg>
)
export const HouseholdIcon = (p) => (
  <svg {...base} {...p}><path d="M4 10l8-6 8 6v10H4V10z" /></svg>
)
export const AllIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" /></svg>
)

export const WATERMARK_ICONS = {
  jacket: JacketIcon,
  dress: DressIcon,
  abaya: AbayaIcon,
  child: ChildIcon,
  home: HouseholdIcon
}
