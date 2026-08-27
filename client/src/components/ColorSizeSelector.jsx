import { SIZES } from '../data/products.js'
import { colorHasStock, sizeAvailableForColor, sizeHasAnyColor } from '../data/skuHelpers.js'

export default function ColorSizeSelector({ product, matrix, selectedColor, selectedSize, onSelectColor, onSelectSize }) {
  return (
    <>
      <div className="selector-block">
        <div className="selector-head">
          <h4>اللون</h4>
          <span className="selected-val">{product.colors.find((c) => c.code === selectedColor)?.name ?? ''}</span>
        </div>
        <div className="color-row">
          {product.colors.map((c) => {
            const has = colorHasStock(matrix, c.code)
            return (
              <button
                key={c.code}
                type="button"
                className={`color-swatch${selectedColor === c.code ? ' selected' : ''}${!has ? ' disabled' : ''}`}
                style={{ background: c.hex }}
                title={c.name}
                disabled={!has}
                onClick={() => onSelectColor(c.code)}
              />
            )
          })}
        </div>
      </div>

      <div className="selector-block">
        <div className="selector-head">
          <h4>المقاس</h4>
          <span className="selected-val">{selectedSize ?? ''}</span>
        </div>
        <div className="size-row">
          {(product.sizes || SIZES).map((s) => {
            const available = selectedColor
              ? sizeAvailableForColor(matrix, selectedColor, s)
              : sizeHasAnyColor(matrix, product.colors, s)
            return (
              <button
                key={s}
                type="button"
                className={`size-chip${selectedSize === s ? ' selected' : ''}${!available ? ' disabled' : ''}`}
                disabled={!available}
                onClick={() => onSelectSize(s)}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
