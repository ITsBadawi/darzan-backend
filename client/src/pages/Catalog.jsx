import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProductsStore } from '../store/useProductsStore.js'
import { useSettingsStore } from '../store/useSettingsStore.js'
import ProductCard from '../components/ProductCard.jsx'
import { MiniFooter } from '../components/Footer.jsx'
import { FilterIcon } from '../components/icons.jsx'
import './Catalog.css'

const DEFAULT_CATS = ['رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي']

const PRICE_RANGES = [
  { label: 'كل الأسعار', min: 0, max: Infinity },
  { label: 'أقل من ٢٠,٠٠٠', min: 0, max: 20000 },
  { label: '٢٠,٠٠٠ – ٣٥,٠٠٠', min: 20000, max: 35000 },
  { label: 'أكثر من ٣٥,٠٠٠', min: 35000, max: Infinity }
]

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCat = searchParams.get('cat') || 'الكل'
  const urlQ = searchParams.get('q') || ''

  const fetchCategories = useSettingsStore((s) => s.fetchCategories)
  const storeCategories = useSettingsStore((s) => s.categories)

  const categories = useMemo(() => {
    return storeCategories.length ? storeCategories : ['الكل', ...DEFAULT_CATS]
  }, [storeCategories])

  const [cat, setCat] = useState(urlCat)
  const [q, setQ] = useState(urlQ)
  const [priceIndex, setPriceIndex] = useState(0)
  const [sort, setSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])

  // Document title and fetch data
  useEffect(() => {
    document.title = cat !== 'الكل' ? `درازن | قسم ${cat}` : 'درازن | كل المنتجات'
    fetchCategories()
  }, [cat, fetchCategories])

  // Sync category and search query state whenever URL params change
  useEffect(() => {
    setCat(searchParams.get('cat') || 'الكل')
    setQ(searchParams.get('q') || '')
  }, [searchParams])

  const range = PRICE_RANGES[priceIndex]
  const allProducts = useProductsStore((s) => s.products)
  const loading = useProductsStore((s) => s.loading)
  const fetchProducts = useProductsStore((s) => s.fetchProducts)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Extract unique colors and sizes from all products for filter chips
  const { allColors, allSizes } = useMemo(() => {
    const colorMap = new Map()
    const sizeSet = new Set()
    allProducts.forEach((p) => {
      if (p.colors) {
        p.colors.forEach((c) => {
          if (c.name && !colorMap.has(c.name)) {
            colorMap.set(c.name, c.hex || '#888')
          }
        })
      }
      if (p.sizes) {
        p.sizes.forEach((s) => sizeSet.add(s))
      }
    })
    return {
      allColors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })),
      allSizes: Array.from(sizeSet)
    }
  }, [allProducts])

  function handleSelectCategory(selectedCat) {
    setCat(selectedCat)
    const newParams = new URLSearchParams(searchParams)
    if (selectedCat === 'الكل') {
      newParams.delete('cat')
    } else {
      newParams.set('cat', selectedCat)
    }
    setSearchParams(newParams)
  }

  function toggleColor(name) {
    setSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  function toggleSizeFilter(sz) {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    )
  }

  function clearFilters() {
    setSelectedColors([])
    setSelectedSizes([])
    setPriceIndex(0)
  }

  const hasAdvancedFilters = selectedColors.length > 0 || selectedSizes.length > 0

  const items = useMemo(() => {
    let list = allProducts.filter((p) => {
      const inCat = cat === 'الكل' || p.cat === cat
      const inPrice = p.priceMax >= range.min && p.priceMin <= range.max
      const inSearch = !q || p.name.includes(q)
      const inColor = selectedColors.length === 0 || (p.colors && p.colors.some((c) => selectedColors.includes(c.name)))
      const inSize = selectedSizes.length === 0 || (p.sizes && p.sizes.some((s) => selectedSizes.includes(s)))
      return inCat && inPrice && inSearch && inColor && inSize
    })
    if (sort === 'price-high') list = [...list].sort((a, b) => b.priceMax - a.priceMax)
    if (sort === 'price-low') list = [...list].sort((a, b) => a.priceMin - b.priceMin)
    return list
  }, [cat, q, range, sort, allProducts, selectedColors, selectedSizes])

  const pageTitle = q
    ? `نتائج البحث عن "${q}"`
    : cat && cat !== 'الكل'
    ? `قسم ${cat}`
    : 'كل المنتجات'

  const pageSubtitle = q
    ? `عرض المنتجات المطابقة لبحثك (${items.length} منتج)`
    : cat && cat !== 'الكل'
    ? `تصفّح تشكيلة ملابس الجملة لقسم ${cat}`
    : 'تصفّح كامل تشكيلة درازن من الملابس الجملة'

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">الرئيسية</Link> /{' '}
        {cat && cat !== 'الكل' ? (
          <>
            <Link to="/catalog">كل المنتجات</Link> / <span className="current">قسم {cat}</span>
          </>
        ) : q ? (
          <>
            <Link to="/catalog">كل المنتجات</Link> / <span className="current">بحث: {q}</span>
          </>
        ) : (
          <span className="current">كل المنتجات</span>
        )}
      </div>
      <div className="page-head">
        <h1 className="display">{pageTitle}</h1>
        <p>{pageSubtitle}</p>
      </div>

      <div className="catalog-wrap">
        <div>
          <button className="filters-mobile-toggle" onClick={() => setFiltersOpen((v) => !v)}>
            <FilterIcon width={16} height={16} />
            تصفية النتائج
          </button>
          <div className={`filters${filtersOpen ? '' : ' mobile-hidden'}`}>
            <div className="filter-group">
              <h4>التصنيف</h4>
              <div className="cat-list">
                {categories.map((c) => (
                  <button key={c} className={cat === c ? 'active' : ''} onClick={() => handleSelectCategory(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h4>نطاق السعر</h4>
              <div className="price-list">
                {PRICE_RANGES.map((r, i) => (
                  <button key={r.label} className={priceIndex === i ? 'active' : ''} onClick={() => setPriceIndex(i)}>{r.label}</button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            {allColors.length > 0 && (
              <div className="filter-group">
                <h4>اللون</h4>
                <div className="color-filter-list">
                  {allColors.map((c) => (
                    <button
                      key={c.name}
                      className={`color-filter-chip${selectedColors.includes(c.name) ? ' active' : ''}`}
                      onClick={() => toggleColor(c.name)}
                      title={c.name}
                    >
                      <span className="color-dot" style={{ background: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            {allSizes.length > 0 && (
              <div className="filter-group">
                <h4>المقاس</h4>
                <div className="size-filter-list">
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      className={`size-filter-chip${selectedSizes.includes(sz) ? ' active' : ''}`}
                      onClick={() => toggleSizeFilter(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasAdvancedFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                مسح جميع الفلاتر ✕
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="toolbar">
            <span className="result-count">{items.length} منتج</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">الأحدث</option>
              <option value="price-high">الأعلى سعراً</option>
              <option value="price-low">الأقل سعراً</option>
            </select>
          </div>

          {loading && allProducts.length === 0 ? (
            <div className="empty-state">
              <h3>جاري تحميل المنتجات...</h3>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>لا توجد نتائج</h3>
              <p>جرّب تغيير التصنيف أو نطاق السعر أو الألوان</p>
            </div>
          ) : (
            <div className="grid">
              {items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      <MiniFooter />
    </>
  )
}
