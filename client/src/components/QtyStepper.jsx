export default function QtyStepper({ qty, onChange, max }) {
  return (
    <div className="qty-stepper">
      <button type="button" onClick={() => onChange(Math.max(1, qty - 1))}>−</button>
      <span>{qty}</span>
      <button type="button" onClick={() => onChange(max ? Math.min(max, qty + 1) : qty + 1)}>+</button>
    </div>
  )
}
