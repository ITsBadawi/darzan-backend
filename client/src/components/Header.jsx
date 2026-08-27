import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCartStore, selectCartCount } from '../store/useCartStore.js'
import { useSettingsStore } from '../store/useSettingsStore.js'
import { SearchIcon, HeartIcon, CartIcon } from './icons.jsx'
import SearchModal from './SearchModal.jsx'

export default function Header() {
  const navigate = useNavigate()
  const cartCount = useCartStore(selectCartCount)
  const [searchOpen, setSearchOpen] = useState(false)

  const fetchSettings = useSettingsStore((s) => s.fetchPublicSettings)
  const fetchCategories = useSettingsStore((s) => s.fetchCategories)
  const settings = useSettingsStore((s) => s.settings)
  const categories = useSettingsStore((s) => s.categories)

  useEffect(() => {
    fetchSettings()
    fetchCategories()
  }, [fetchSettings, fetchCategories])

  const announceText = settings?.announce_text || 'توصيل لجميع محافظات العراق · الدفع عند الاستلام'
  const announceEnabled = settings?.announce_enabled !== undefined
    ? (settings.announce_enabled === 'true' || settings.announce_enabled === true)
    : true

  const navCats = (Array.isArray(categories) ? categories : [])
    .filter((c) => c && c !== 'الكل')
    .slice(0, 5)

  return (
    <>
      {announceEnabled && (
        <div className="announce-bar">
          {announceText}
        </div>
      )}
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-mark">
            <span className="name display">درازن</span>
            <span className="tag">جملة الملابس · العراق</span>
          </Link>

          <nav className="nav-links">
            <Link to="/">الرئيسية</Link>
            {navCats.map((c) => (
              <Link key={c} to={`/catalog?cat=${encodeURIComponent(c)}`}>{c}</Link>
            ))}
          </nav>

          <div className="search-desktop" onClick={() => setSearchOpen(true)} style={{ cursor: 'pointer' }}>
            <SearchIcon width={16} height={16} />
            <input
              type="text"
              placeholder="ابحث عن منتج فوري..."
              readOnly
              onClick={() => setSearchOpen(true)}
              style={{ cursor: 'pointer' }}
            />
          </div>

          <div className="header-icons">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="بحث فوري">
              <SearchIcon width={20} height={20} />
            </button>
            <Link className="icon-btn" to="/favorites" aria-label="المفضلة">
              <HeartIcon width={20} height={20} />
            </Link>
            <Link className="icon-btn" to="/cart" aria-label="السلة">
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
              <CartIcon width={20} height={20} />
            </Link>
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
