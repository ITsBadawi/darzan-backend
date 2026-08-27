import { NavLink, useLocation } from 'react-router-dom'
import { useCartStore, selectCartCount } from '../store/useCartStore.js'
import { HomeIcon, GridIcon, HeartIcon, CartIcon } from './icons.jsx'

const tabs = [
  { to: '/', label: 'الرئيسية', Icon: HomeIcon, end: true },
  { to: '/catalog', label: 'التصنيفات', Icon: GridIcon },
  { to: '/favorites', label: 'المفضلة', Icon: HeartIcon },
  { to: '/cart', label: 'السلة', Icon: CartIcon }
]

export default function TabBar() {
  const location = useLocation()
  const cartCount = useCartStore(selectCartCount)

  // Hide mobile TabBar on product detail and checkout pages to avoid overlapping action buttons
  if (location.pathname.startsWith('/product/') || location.pathname === '/checkout') {
    return null
  }

  return (
    <nav className="tabbar">
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          {to === '/cart' && cartCount > 0 && <span className="cartbadge">{cartCount}</span>}
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
