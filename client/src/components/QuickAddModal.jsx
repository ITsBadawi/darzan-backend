import { useState, useMemo, useEffect } from 'react'
import { useCartStore } from '../store/useCartStore.js'
import ColorSizeSelector from './ColorSizeSelector.jsx'
import QtyStepper from './QtyStepper.jsx'
import { SIZES } from '../data/products.js'

export default function QuickAddModal({ product, isOpen, onClose, onAdded }) {
  if (!product || !isOpen) return null

  const saleType = product.sale_type || product.saleType || 'both'
  const pricePiece = product.price_piece !== undefined ? product.price_piece : (product.pricePiece !== undefined ? product.pricePiece : (product.priceMin || product.price_min || 0))
  const priceDozen = product.price_dozen !== undefined ? product.price_dozen : (product.priceDozen !== undefined ? product.priceDozen : (pricePiece * 12))
  const minPieceQty = Math.max(1, Number(product.min_piece_qty || product.minPieceQty || 1))
  const minDozenQty = Math.max(1, Number(product.min_dozen_qty || product.minDozenQty || 1))

  const [unit, setUnit] = useState(() => (saleType === 'dozen' ? 'dozen' : 'piece'))
  const currentMoq = unit === 'dozen' ? minDozenQty : minPieceQty

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
          price: (product.priceMin || pricePiece) + priceBump,
          stock: 10,
          sku: `DZN-${product.id}-${color.code}-${size}`
        }
      })
    })
    return m
  }, [product, pricePiece])

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.code || null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [qty, setQty] = useState(currentMoq)

  useEffect(() => {
    if (product?.colors?.[0]?.code) {
      setSelectedColor(product.colors[0].code)
    }
    setSelectedSize(null)
    const initialUnit = saleType === 'dozen' ? 'dozen' : 'piece'
    setUnit(initialUnit)
    setQty(initialUnit === 'dozen' ? minDozenQty : minPieceQty)
  }, [product, saleType, minPieceQty, minDozenQty])

  function switchUnit(newUnit) {
    setUnit(newUnit)
    const targetMoq = newUnit === 'dozen' ? minDozenQty : minPieceQty
    setQty(targetMoq)
  }

  const addItem = useCartStore((s) => s.addItem)

  const colorObj = product.colors?.find((c) => c.code === selectedColor) || product.colors?.[0]
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
  const currentUnitPrice = unit === 'dozen' ? priceDozen : (sku ? sku.price : pricePiece)

  function handleAddToCart() {
    if (!sku) return
    const lineId = `${product.id}-${selectedColor}-${selectedSize}-${unit}`
    const unitName = unit === 'dozen' ? 'درزن' : 'قطعة'

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
      unit_type: unit,
      unitType: unit,
      unit_name: unitName,
      unitName: unitName,
      min_qty: currentMoq,
      price: currentUnitPrice,
      unit_price: currentUnitPrice,
      sku: sku.sku,
      sku_code: sku.sku,
      sku_id: sku.id || null
    })

    if (onAdded) {
      const unitExtra = unit === 'dozen' ? ` (${qty * 12} قطعة)` : ''
      onAdded(`تمت إضافة ${qty} ${unitName}${unitExtra} × ${product.name} (${colorObj.name} / ${selectedSize}) إلى السلة`)
    }
    onClose()
  }

  const priceLabel = unit === 'dozen'
    ? `${priceDozen.toLocaleString('ar')} د.ع / درزن`
    : (sku
      ? `${sku.price.toLocaleString('ar')} د.ع / قطعة`
      : `${(product.priceMin || pricePiece).toLocaleString('ar')} د.ع`)

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
                    <span className="stock-low">الكمية محدودة — تبقّى ${sku.stock} فقط</span>
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
          {/* Unit selection if both available */}
          {saleType === 'both' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
              <button
                type="button"
                className={`unit-switch-btn${unit === 'piece' ? ' active' : ''}`}
                onClick={() => switchUnit('piece')}
                style={{ padding: '6px 4px' }}
              >
                <span className="btn-title" style={{ fontSize: 12.5 }}>👕 بالقطعة</span>
              </button>
              <button
                type="button"
                className={`unit-switch-btn${unit === 'dozen' ? ' active' : ''}`}
                onClick={() => switchUnit('dozen')}
                style={{ padding: '6px 4px' }}
              >
                <span className="btn-title" style={{ fontSize: 12.5 }}>📦 بالدرزن</span>
              </button>
            </div>
          )}

          <ColorSizeSelector
            product={product}
            matrix={matrix}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={selectColor}
            onSelectSize={selectSize}
          />

          <div className="qty-row" style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h4 style={{ margin: 0, fontSize: 13 }}>الكمية</h4>
              {currentMoq > 1 && (
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                  (أقل طلب: {currentMoq})
                </span>
              )}
            </div>
            <QtyStepper
              qty={qty}
              min={currentMoq}
              onChange={setQty}
              max={unit === 'dozen' ? Math.max(1, Math.floor((sku?.stock || 120) / 12)) : sku?.stock}
              unitLabel={unit === 'dozen' ? 'درزن' : 'قطعة'}
            />
          </div>
        </div>

        <div className="quick-add-footer">
          <button className="btn-cart" disabled={!sku} onClick={handleAddToCart}>
            {sku ? (
              <>
                <span>إضافة {qty} {unit === 'dozen' ? 'درزن' : 'قطعة'} للسلة 🛍️</span>
                <span className="btn-cart-price">({(currentUnitPrice * qty).toLocaleString('ar')} د.ع)</span>
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
