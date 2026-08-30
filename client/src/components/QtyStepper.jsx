export default function QtyStepper({ qty, onChange, min = 1, max, unitLabel }) {
  const minVal = Math.max(1, Number(min) || 1)
  return (
    <div className="qty-stepper">
      <button
        type="button"
        disabled={qty <= minVal}
        onClick={() => onChange(Math.max(minVal, qty - 1))}
        aria-label="إنقاص الكمية"
        style={qty <= minVal ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        −
      </button>
      <span>{qty}{unitLabel ? ` ${unitLabel}` : ''}</span>
      <button
        type="button"
        disabled={max && qty >= max}
        onClick={() => onChange(max ? Math.min(max, qty + 1) : qty + 1)}
        aria-label="زيادة الكمية"
      >
        +
      </button>
    </div>
  )
}
