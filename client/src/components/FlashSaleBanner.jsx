import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../store/useSettingsStore.js'

export default function FlashSaleBanner() {
  const settings = useSettingsStore((s) => s.settings)

  const enabled = settings?.flash_sale_enabled !== undefined
    ? (settings.flash_sale_enabled === 'true' || settings.flash_sale_enabled === true)
    : true

  const title = settings?.flash_sale_title || 'عروض الخاطفة الجملة — الساعات الأخيرة'
  const discount = settings?.flash_sale_discount || 'خصم ٣٥٪-'
  const flashEnd = settings?.flash_sale_end

  const [targetTime, setTargetTime] = useState(() => {
    if (flashEnd) {
      const parsed = new Date(flashEnd).getTime()
      if (!isNaN(parsed) && parsed > Date.now()) return parsed
    }
    return Date.now() + 18 * 3600 * 1000
  })

  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (flashEnd) {
      const parsed = new Date(flashEnd).getTime()
      if (!isNaN(parsed) && parsed > Date.now()) {
        setTargetTime(parsed)
      }
    }
  }, [flashEnd])

  useEffect(() => {
    if (!enabled) return

    function calculateTime() {
      const diff = targetTime - Date.now()
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ hours, minutes, seconds })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [enabled, targetTime])

  if (!enabled) return null

  const formatNum = (num) => String(num).padStart(2, '0')

  return (
    <div className="flash-sale-wrapper">
      <div className="flash-sale-banner">
        <div className="flash-sale-info">
          <div className="flash-badge">⚡ عرض خاطف</div>
          <h3 className="flash-title display">{title}</h3>
          <p className="flash-sub">خصومات استثنائية لفترة محدودة على أرقى الموديلات بالجملة</p>
        </div>

        <div className="flash-timer-box">
          <div className="timer-unit">
            <span className="number">{formatNum(timeLeft.hours)}</span>
            <span className="unit-label">ساعة</span>
          </div>
          <span className="colon">:</span>
          <div className="timer-unit">
            <span className="number">{formatNum(timeLeft.minutes)}</span>
            <span className="unit-label">دقيقة</span>
          </div>
          <span className="colon">:</span>
          <div className="timer-unit">
            <span className="number">{formatNum(timeLeft.seconds)}</span>
            <span className="unit-label">ثانية</span>
          </div>
        </div>

        <div className="flash-action">
          <span className="discount-pill">{discount}</span>
          <Link to="/catalog" className="btn-flash-shop">
            استغل العرض الآن ←
          </Link>
        </div>
      </div>
    </div>
  )
}
