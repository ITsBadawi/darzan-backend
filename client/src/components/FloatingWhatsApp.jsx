import { useState, useEffect } from 'react'
import { WhatsAppIcon } from './icons.jsx'
import api from '../lib/api.js'

const FALLBACK_PHONE = '9647801234567'

export default function FloatingWhatsApp() {
  const [phone, setPhone] = useState(FALLBACK_PHONE)

  useEffect(() => {
    api.getPublicSettings()
      .then((data) => {
        if (data?.whatsapp_number) setPhone(data.whatsapp_number)
      })
      .catch(() => { /* use fallback */ })
  }, [])

  const msg = 'مرحباً، أود الاستفسار عن عروض الملابس الجملة لدى درازن'
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-wa-btn"
      aria-label="تواصل عبر واتساب"
      title="تواصل معنا مباشرة عبر واتساب"
    >
      <WhatsAppIcon width={24} height={24} />
      <span className="wa-txt">تواصل معنا</span>
      <span className="online-dot" />
    </a>
  )
}
