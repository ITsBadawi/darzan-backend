import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProductsStore } from '../store/useProductsStore.js'
import { SearchIcon } from './icons.jsx'

const POPULAR_SEARCHES = ['رجالي', 'نسائي', 'فساتين', 'أطفال', 'كنزة صوف', 'بيتي']

export default function SearchModal({ isOpen, onClose }) {
  const [q, setQ] = useState('')
  const products = useProductsStore((s) => s.products)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQ('')
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const query = q.trim().toLowerCase()
  const results = query
    ? (Array.isArray(products) ? products : []).filter(
        (p) =>
          p &&
          ((p.name && String(p.name).toLowerCase().includes(query)) ||
          (p.cat && String(p.cat).toLowerCase().includes(query)) ||
          (p.category && String(p.category).toLowerCase().includes(query)) ||
          (p.description && String(p.description).toLowerCase().includes(query)))
      )
    : []

  function handleSelectProduct(id) {
    onClose()
    navigate(`/product/${id}`)
  }

  function handleSearchTerm(term) {
    onClose()
    navigate(`/catalog?q=${encodeURIComponent(term)}`)
  }

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrap">
            <SearchIcon width={18} height={18} className="search-input-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="ابحث عن منتج، خامة، أو تصنيف..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button className="clear-btn" onClick={() => setQ('')} aria-label="مسح البحث">
                ✕
              </button>
            )}
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            إلغاء
          </button>
        </div>

        <div className="search-modal-body">
          {!query ? (
            <div className="popular-searches">
              <span className="label">البحوث الشائعة:</span>
              <div className="chips">
                {POPULAR_SEARCHES.map((term) => (
                  <button key={term} onClick={() => handleSearchTerm(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results-list">
              <div className="results-count">تم العثور على {results.length} منتج:</div>
              {results.slice(0, 8).map((p) => {
                const img = p.cover_image || p.coverImage || p.image_url || p.colors?.[0]?.image_url
                const minPrice = typeof p.priceMin === 'number' ? p.priceMin : 0
                const maxPrice = typeof p.priceMax === 'number' ? p.priceMax : minPrice
                const priceStr =
                  minPrice === maxPrice
                    ? `${minPrice.toLocaleString('ar')} د.ع`
                    : `${minPrice.toLocaleString('ar')} – ${maxPrice.toLocaleString('ar')} د.ع`

                return (
                  <div key={p.id} className="search-result-item" onClick={() => handleSelectProduct(p.id)}>
                    <div
                      className="result-thumb"
                      style={
                        img
                          ? { backgroundImage: `url(${img})` }
                          : { background: `linear-gradient(150deg, ${p.colors?.[0]?.g1 || '#ddd'} 0%, ${p.colors?.[0]?.g2 || '#bbb'} 100%)` }
                      }
                    />
                    <div className="result-info">
                      <div className="result-title">{p.name}</div>
                      <div className="result-cat">{p.cat || p.category}</div>
                    </div>
                    <div className="result-price">{priceStr}</div>
                  </div>
                )
              })}
              {results.length > 8 && (
                <button
                  className="view-all-results"
                  onClick={() => {
                    onClose()
                    navigate(`/catalog?q=${encodeURIComponent(q)}`)
                  }}
                >
                  عرض جميع النتائج ({results.length}) ←
                </button>
              )}
            </div>
          ) : (
            <div className="no-results-box">
              <p>لم نجد منتجات تطابق "<strong>{q}</strong>"</p>
              <button onClick={() => handleSearchTerm('')}>تصفّح كافة المنتجات</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
