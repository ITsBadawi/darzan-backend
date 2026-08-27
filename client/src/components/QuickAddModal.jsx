import { useState, useMemo, useEffect } from 'react'
import { useCartStore } from '../store/useCartStore.js'
import ColorSizeSelector from './ColorSizeSelector.jsx'
import QtyStepper from './QtyStepper.jsx'
import { SIZES } from '../data/products.js'

export default function QuickAddModal({ product, isOpen, onClose, onAdded }) {
  if (!product || !isOpen) return null

  // SKU Matrix generation
  const matrix = useMemo(() => {
    if (product.skuMatrix && Object.keys(product.skuMatrix).length > 0) {
      return product.skuMatrix
    }
    const m = {}
    const sizes = product.sizes || SIZES
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

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.code || null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product?.colors?.[0]?.code) {
      setSelectedColor(product.colors[0].code)
    }
    setSelectedSize(null)
    setQty(1)
  }, [product])

  const addItem = useCartStore((s) => s.addItem)

  const colorObj = product.colors.find((c) => c.code === selectedColor)
  const sku = selectedColor && selectedSize ? matrix[`${selectedColor}-${selectedSize}`] : null

  function selectColor(code) {
    setSelectedColor(code)
    if (selectedSize && !matrix[`${code}-${selectedSize}`]?.stock) setSelectedSize(null)
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

  const mainImg = product.cover_image || product.coverImage || product.image_url || colorObj?.image_url

  function handleAddToCart() {
    if (!sku) return
    const lineId = `${product.id}-${selectedColor}-${selectedSize}`
    addItem({
      lineId,
      productId: product.id,
      product_id: product.id,
      name: product.name,
      product_name: product.name,
      image: mainImg || null,
      image_url: mainImg || null,
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

    if (onAdded) {
      onAdded(`تمت إضافة ${qty} × ${product.name} (${colorObj.name} / ${selectedSize}) إلى السلة`)
    }
    onClose()
  }

  const priceLabel = sku
    ? `${sku.price.toLocaleString('ar')} د.ع`
    : `${product.priceMin.toLocaleString('ar')} – ${product.priceMax.toLocaleString('ar')} د.ع`

  return (
    <div className="quick-add-backdrop" onClick={onClose}>
      <div className="quick-add-sheet" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="quick-add-handle-bar" />
        <div className="quick-add-header">
          <div className="quick-add-product-info">
            <div
              className="quick-add-thumb"
              style={
                mainImg
                  ? { backgroundImage: `url(${mainImg})` }
                  : { background: `linear-gradient(150deg, ${colorObj?.g1 || '#ddd'} 0%, ${colorObj?.g2 || '#bbb'} 100%)` }
              }
            />
            <div className="quick-add-meta">
              <div className="quick-add-title" title={product.name}>{product.name}</div>
              <div className="quick-add-price">{priceLabel}</div>
              {sku && (
                <div className="quick-add-stock">
                  {sku.stock > 5 ? (
                    <span className="stock-in">متوفر في المخزون ✓</span>
                  ) : (
                    <span className="stock-low">الكمية محدودة — تبقّى {sku.stock} فقط</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button className="quick-add-close" onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        </div>

        <div className="quick-add-body">
          <ColorSizeSelector
            product={product}
            matrix={matrix}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={selectColor}
            onSelectSize={selectSize}
          />

          <div className="qty-row">
            <h4>الكمية</h4>
            <QtyStepper qty={qty} onChange={setQty} max={sku?.stock} />
          </div>
        </div>

        <div className="quick-add-footer">
          <button className="btn-cart" disabled={!sku} onClick={handleAddToCart}>
            {sku ? (
              <>
                <span>إضافة إلى السلة 🛍️</span>
                <span className="btn-cart-price">({(sku.price * qty).toLocaleString('ar')} د.ع)</span>
              </>
            ) : (
              'حدد المقاس واللون للاستمرار'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
