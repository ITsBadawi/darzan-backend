import { useEffect, useState, useCallback, useRef } from 'react'
import { CheckIcon } from './icons.jsx'

export function useToast() {
  const [message, setMessage] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((text) => {
    setMessage(text)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMessage(null), 2600)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { message, showToast }
}

export default function Toast({ message }) {
  return (
    <div className={`toast${message ? ' show' : ''}`}>
      <CheckIcon width={15} height={15} />
      <span>{message}</span>
    </div>
  )
}
