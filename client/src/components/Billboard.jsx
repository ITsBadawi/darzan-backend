import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api.js'

const DEFAULT_SLIDES = [
  { key: 's1', tag: 'تخفيضات الشتاء', title: 'عروض الموسم الكبرى على الملابس الجملة', desc: 'خصومات تصل إلى 30% على كافة التشكيلات الجديدة مع توصيل لجميع المحافظات', cta: 'تسوّق التشكيلة الآن', to: '/catalog', bg_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop' },
  { key: 's2', tag: 'وصل حديثاً', title: 'تشكيلة 2026 الحصرية للرجالي والنسائي', desc: 'أحدث الموديلات من المصانع مباشرة بأسعار تنافسية للتجار', cta: 'شاهد التشكيلة', to: '/catalog', bg_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop' },
  { key: 's3', tag: 'أسعار الجملة', title: 'درازن — شريكك الموثوق لتجارة الملابس بالعراق', desc: 'اطلب جملة لمتجرك مع خيارات شحن سريعة ودفع عند الاستلام', cta: 'ابدأ الطلب الآن', to: '/catalog', bg_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop' }
]

export default function Billboard() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES)
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)
  const startXRef = useRef(0)

  useEffect(() => {
    api.getPublicSettings()
      .then((data) => {
        if (data?.hero_slides) {
          try {
            const parsed = typeof data.hero_slides === 'string' ? JSON.parse(data.hero_slides) : data.hero_slides
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed.map((s, idx) => ({ ...s, key: s?.key || `custom-s${idx}` })))
            }
          } catch { /* use fallback */ }
        }
      })
      .catch(() => { /* use fallback */ })
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  function goTo(i) {
    if (slides.length === 0) return
    setIndex((i + slides.length) % slides.length)
  }

  function onTouchStart(e) {
    if (e.touches && e.touches[0]) {
      startXRef.current = e.touches[0].clientX
    }
    clearInterval(timerRef.current)
  }

  function onTouchEnd(e) {
    if (!e.changedTouches || !e.changedTouches[0]) return
    const dx = e.changedTouches[0].clientX - startXRef.current
    if (dx > 40) goTo(index - 1)
    else if (dx < -40) goTo(index + 1)
    if (slides.length > 1) {
      timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    }
  }

  const safeSlides = Array.isArray(slides) && slides.length > 0 ? slides : DEFAULT_SLIDES

  return (
    <div className="billboard-wrap">
      <div className="billboard">
        <div
          className="track"
          style={{ transform: `translateX(${-index * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {safeSlides.map((s, idx) => {
            const hasBg = Boolean(s?.bg_url)
            const slideStyle = hasBg
              ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${s.bg_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : {}
            return (
              <div className={`slide ${s?.key || ''}`} key={s?.key || idx} style={slideStyle}>
                <div className="slide-content">
                  {s?.tag && <span className="tag-badge">{s.tag}</span>}
                  <h3 className="display">{s?.title || 'درازن لتجارة الجملة'}</h3>
                  {s?.desc && <p>{s.desc}</p>}
                  <Link className="cta" to={s?.to || '/catalog'}>{s?.cta || 'تصفّح الآن'}</Link>
                </div>
                {!hasBg && <div className="slide-visual" aria-hidden="true" />}
              </div>
            )
          })}
        </div>
        {safeSlides.length > 1 && (
          <div className="hero-nav">
            {safeSlides.map((s, i) => (
              <button
                key={s?.key || i}
                className={`dot${i === index ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`الشريحة ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
