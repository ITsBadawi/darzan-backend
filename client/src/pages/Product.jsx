import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore.js'
import { useFavoritesStore } from '../store/useFavoritesStore.js'
import { useProductsStore } from '../store/useProductsStore.js'
import ColorSizeSelector from '../components/ColorSizeSelector.jsx'
import QtyStepper from '../components/QtyStepper.jsx'
import Toast, { useToast } from '../components/Toast.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { MiniFooter } from '../components/Footer.jsx'
import { HeartIcon, PlayIcon, TruckIcon, CashIcon, ChatIcon, WATERMARK_ICONS } from '../components/icons.jsx'
import './Product.css'

export default function Product() {
  const { id } = useParams()
  const products = useProductsStore((s) => s.products)
  const loading = useProductsStore((s) => s.loading)
  const fetchProducts = useProductsStore((s) => s.fetchProducts)
  const product = products.find((p) => p.id === id)

  // Always scroll to top of page and update document title when navigating to a new product
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (product?.name) {
      document.title = `${product.name} | درازن`
    }
  }, [id, product])

  // Fetch products if not loaded yet
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [products.length, fetchProducts])

  if (loading && !product) {
    return (
      <div className="not-found">
        <h2 className="display">جاري تحميل المنتج...</h2>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2 className="display">المنتج غير موجود</h2>
        <Link to="/catalog">تصفّح كل المنتجات</Link>
      </div>
    )
  }

  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }) {
  // Use API-provided skuMatrix if available, otherwise generate locally
  const matrix = useMemo(() => {
    if (product.skuMatrix && Object.keys(product.skuMatrix).length > 0) {
      return product.skuMatrix
    }
    // Fallback: generate locally for demo/offline mode
    const m = {}
    const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
    product.colors.forEach((color) => {
      sizes.forEach((size, i) => {
        const key = `${color.code}-${size}`
        const spread = Math.max(0, product.priceMax - product.priceMin)
        const priceBump = i >= 4 ? (spread > 0 ? Math.round(spread * 0.4) : 0) : 0
        m[key] = {
          price: product.priceMin + priceBump,
          stock: 10,
          sku: `DZN-${product.id}-${color.code}-${size}`
        }
      })
    })
    return m
  }, [product])

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [activeThumb, setActiveThumb] = useState(0)
  const [qty, setQty] = useState(1)
  const { message, showToast } = useToast()

  const addItem = useCartStore((s) => s.addItem)
  const isFav = useFavoritesStore((s) => s.ids.includes(product.id))
  const toggleFav = useFavoritesStore((s) => s.toggle)

  const WatermarkIcon = WATERMARK_ICONS[product.icon]
  const colorObj = product.colors.find((c) => c.code === selectedColor)
  const sku = selectedColor && selectedSize ? matrix[`${selectedColor}-${selectedSize}`] : null

  function selectColor(code) {
    setSelectedColor(code)
    if (selectedSize && !matrix[`${code}-${selectedSize}`]?.stock) setSelectedSize(null)
    setActiveThumb(0)
  }
  function selectSize(size) {
    setSelectedSize(size)
    if (selectedColor && !matrix[`${selectedColor}-${size}`]?.stock) {
      const fallback = product.colors.find((c) => matrix[`${c.code}-${size}`]?.stock > 0)
      if (fallback) setSelectedColor(fallback.code)
    } else if (!selectedColor) {
      const fallback = product.colors.find((c) => matrix[`${c.code}-${size}`]?.stock > 0)
      if (fallback) setSelectedColor(fallback.code)
    }
  }

  // Collect images for current color or product
  const colorImage = colorObj?.image_url || colorObj?.imageUrl
  const colorImages = colorObj?.id ? (product.images?.[colorObj.id] || []) : []
  const defaultImages = product.images?.['default'] || product.images?.['all'] || []
  const rawList = [
    ...(colorImage ? [colorImage] : []),
    ...colorImages,
    ...defaultImages
  ]
  const imageList = rawList.length > 0
    ? rawList.map((img) => typeof img === 'string' ? img : img.url)
    : (product.cover_image || product.coverImage || product.image_url ? [product.cover_image || product.coverImage || product.image_url] : [])

  const currentImg = imageList[activeThumb] || imageList[0]

  function handleAddToCart() {
    if (!sku) return
    const lineId = `${product.id}-${selectedColor}-${selectedSize}`
    addItem({
      lineId,
      productId: product.id,
      product_id: product.id,
      name: product.name,
      product_name: product.name,
      image: currentImg || null,
      image_url: currentImg || null,
      colorName: colorObj.name,
      color_name: colorObj.name,
      colorHex: colorObj.hex,
      color_hex: colorObj.hex,
      g1: colorObj.g1,
      g2: colorObj.g2,
      size: selectedSize,
      qty,
      price: sku.price,
      unit_price: sku.price,
      sku: sku.sku,
      sku_code: sku.sku,
      sku_id: sku.id || null
    })
    showToast(`تمت إضافة ${qty} × ${product.name} (${colorObj.name} / ${selectedSize}) إلى السلة`)
    setQty(1)
  }

  const galleryStyle = currentImg
    ? { background: '#f5f2eb' }
    : colorObj
      ? { background: `linear-gradient(150deg, ${colorObj.g1} 0%, ${colorObj.g2} 100%)` }
      : { background: `linear-gradient(150deg, ${product.colors[0].g1} 0%, ${product.colors[0].g2} 100%)` }

  const priceLabel = sku
    ? `${sku.price.toLocaleString('ar')} د.ع`
    : `${product.priceMin.toLocaleString('ar')} – ${product.priceMax.toLocaleString('ar')} د.ع (حسب المقاس)`

  const allProducts = useProductsStore((s) => s.products)
  const related = allProducts.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 4)

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">الرئيسية</Link> / <Link to={`/catalog?cat=${encodeURIComponent(product.cat)}`}>{product.cat}</Link> / <span className="current">{product.name}</span>
      </div>

      <div className="product-wrap">
        <div className="gallery">
          <div className="main-image" style={galleryStyle}>
            {currentImg && (
              <img
                src={currentImg}
                alt={product.name}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            )}
            <button className={`fav-lg${isFav ? ' active' : ''}`} onClick={() => toggleFav(product.id)} aria-label="أضف للمفضلة">
              <HeartIcon />
            </button>
            {!currentImg && WatermarkIcon && <WatermarkIcon className="watermark" />}
            <div className="video-chip"><PlayIcon width={12} height={12} /> فيديو المنتج</div>
          </div>

          <div className="thumbs">
            {imageList.length > 0 ? (
              imageList.map((img, i) => (
                <div
                  key={i}
                  className={`thumb${activeThumb === i ? ' active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                  style={{ overflow: 'hidden', position: 'relative' }}
                >
                  <img src={img} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))
            ) : (
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`thumb${activeThumb === i ? ' active' : ''}`}
                  style={galleryStyle}
                  onClick={() => setActiveThumb(i)}
                />
              ))
            )}
          </div>
        </div>

        <div className="info-panel">
          <div className="p-category">{product.cat}</div>
          <h1 className="p-name display">{product.name}</h1>
          <div className="p-sku-code">
            {sku ? `الكود الداخلي: ${sku.sku}` : 'اختر اللون والمقاس لعرض التفاصيل'}
          </div>

          <div className="p-price">{priceLabel}</div>
          <div className={`stock-msg ${sku ? (sku.stock > 5 ? 'ok' : 'low') : 'pick'}`}>
            {sku
              ? sku.stock > 5 ? 'متوفر في المخزون ✓' : `الكمية محدودة — تبقّى ${sku.stock} فقط`
              : 'فضلاً اختر اللون والمقاس'}
          </div>

          <ColorSizeSelector
            product={product}
            matrix={matrix}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={selectColor}
            onSelectSize={selectSize}
          />

          <div className="qty-row">
            <h4 style={{ fontSize: 13.5, fontWeight: 600 }}>الكمية</h4>
            <QtyStepper qty={qty} onChange={setQty} max={sku?.stock} />
          </div>

          <div className="action-row">
            <button className="btn-cart" disabled={!sku} onClick={handleAddToCart}>
              أضف إلى السلة
            </button>
          </div>

          <div className="divider" />

          <div className="desc-block">
            <h4>عن المنتج</h4>
            <p>{product.description}</p>
          </div>

          <div className="trust-mini">
            <div className="row"><TruckIcon width={17} height={17} /> توصيل بري لجميع محافظات العراق</div>
            <div className="row"><CashIcon width={17} height={17} /> الدفع عند الاستلام</div>
            <div className="row"><ChatIcon width={17} height={17} /> تأكيد مباشر ومتابعة سريعة</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <div className="section">
            <div className="section-head"><h2 className="display">قد يعجبك أيضاً</h2></div>
          </div>
          <div className="grid grid--home">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}

      <MiniFooter />
      <Toast message={message} />
    </>
  )
}
