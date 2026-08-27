import { useState, useEffect } from 'react'
import api from '../../lib/api.js'
import { useSettingsStore } from '../../store/useSettingsStore.js'

const DEFAULT_SLIDES = [
  { key: 's1', tag: 'تخفيض', title: 'تخفيضات الشتاء', desc: 'خصم يصل إلى ٢٥٪ على تشكيلة الشتاء بالكامل', cta: 'تسوّق الآن', to: '/catalog', bg_url: '' },
  { key: 's2', tag: 'جديد', title: 'وصل حديثاً', desc: 'تشكيلة الشتاء الجديدة بكل الألوان والمقاسات', cta: 'شاهد التشكيلة', to: '/catalog', bg_url: '' },
  { key: 's3', tag: 'جملة', title: 'أسعار الجملة', desc: 'أفضل أسعار الجملة لتجار التجزئة في عموم العراق', cta: 'اطلب الآن', to: '/catalog', bg_url: '' }
]

export default function Settings() {
  const setStoreSettings = useSettingsStore((s) => s.setSettings)
  const invalidateSettings = useSettingsStore((s) => s.invalidateSettings)

  const [waNumber, setWaNumber] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [returnPolicy, setReturnPolicy] = useState('')
  const [announceText, setAnnounceText] = useState('توصيل لجميع محافظات العراق · الدفع عند الاستلام')
  const [announceEnabled, setAnnounceEnabled] = useState(true)
  const [heroSlides, setHeroSlides] = useState(DEFAULT_SLIDES)

  // 1. Promo Strip Banner ("نهاية الموسم -30%") settings
  const [promoEnabled, setPromoEnabled] = useState(true)
  const [promoTitle, setPromoTitle] = useState('نهاية الموسم')
  const [promoText, setPromoText] = useState('على قطع مختارة من التشكيلة الصيفية والشتوية للجملة')
  const [promoDiscount, setPromoDiscount] = useState('٪٣٠-')
  const [promoLink, setPromoLink] = useState('/catalog')
  const [promoBg, setPromoBg] = useState('#8B2E1F')

  // 2. Flash Sale Banner settings
  const [flashSaleEnabled, setFlashSaleEnabled] = useState(true)
  const [flashSaleTitle, setFlashSaleTitle] = useState('عروض الخاطفة الجملة — الساعات الأخيرة')
  const [flashSaleDiscount, setFlashSaleDiscount] = useState('خصم ٣٥٪-')
  const [flashSaleEnd, setFlashSaleEnd] = useState('')

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch settings on mount
  useEffect(() => {
    api.getSettings()
      .then((data) => {
        if (data.whatsapp_number !== undefined) setWaNumber(data.whatsapp_number || '')
        if (data.about_text !== undefined) setAboutText(data.about_text || '')
        if (data.return_policy !== undefined) setReturnPolicy(data.return_policy || '')
        if (data.announce_text !== undefined) setAnnounceText(data.announce_text || '')
        if (data.announce_enabled !== undefined) setAnnounceEnabled(data.announce_enabled === 'true' || data.announce_enabled === true)

        if (data.promo_enabled !== undefined) setPromoEnabled(data.promo_enabled === 'true' || data.promo_enabled === true)
        if (data.promo_title !== undefined) setPromoTitle(data.promo_title || 'نهاية الموسم')
        if (data.promo_text !== undefined) setPromoText(data.promo_text || 'على قطع مختارة من التشكيلة الصيفية والشتوية للجملة')
        if (data.promo_discount !== undefined) setPromoDiscount(data.promo_discount || '٪٣٠-')
        if (data.promo_link !== undefined) setPromoLink(data.promo_link || '/catalog')
        if (data.promo_bg !== undefined) setPromoBg(data.promo_bg || '#8B2E1F')

        if (data.flash_sale_enabled !== undefined) setFlashSaleEnabled(data.flash_sale_enabled === 'true' || data.flash_sale_enabled === true)
        if (data.flash_sale_title !== undefined) setFlashSaleTitle(data.flash_sale_title || 'عروض الخاطفة الجملة — الساعات الأخيرة')
        if (data.flash_sale_discount !== undefined) setFlashSaleDiscount(data.flash_sale_discount || 'خصم ٣٥٪-')
        if (data.flash_sale_end) setFlashSaleEnd(data.flash_sale_end)

        if (data.hero_slides) {
          try {
            const parsed = typeof data.hero_slides === 'string' ? JSON.parse(data.hero_slides) : data.hero_slides
            if (Array.isArray(parsed) && parsed.length > 0) setHeroSlides(parsed)
          } catch { /* use default */ }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Settings error:', err)
        setLoading(false)
      })
  }, [])

  const updateSlide = (index, field, value) => {
    setHeroSlides((list) =>
      list.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const addSlide = () => {
    setHeroSlides((list) => [
      ...list,
      { key: `s-${Date.now()}`, tag: 'عرض خاص', title: 'عنوان البانر الجديد', desc: 'وصف العرض هنا...', cta: 'تصفّح الآن', to: '/catalog', bg_url: '' }
    ])
  }

  const removeSlide = (index) => {
    if (heroSlides.length <= 1) {
      alert('يجب الإبقاء على شريحة واحدة على الأقل.')
      return
    }
    setHeroSlides((list) => list.filter((_, i) => i !== index))
  }

  const handleSlideImageUpload = (index, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        updateSlide(index, 'bg_url', evt.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        whatsapp_number: waNumber,
        about_text: aboutText,
        return_policy: returnPolicy,
        announce_text: announceText,
        announce_enabled: String(announceEnabled),
        promo_enabled: String(promoEnabled),
        promo_title: promoTitle,
        promo_text: promoText,
        promo_discount: promoDiscount,
        promo_link: promoLink,
        promo_bg: promoBg,
        flash_sale_enabled: String(flashSaleEnabled),
        flash_sale_title: flashSaleTitle,
        flash_sale_discount: flashSaleDiscount,
        flash_sale_end: flashSaleEnd,
        hero_slides: JSON.stringify(heroSlides)
      }

      await api.updateSettings(payload)
      
      // Instantly sync frontend store
      setStoreSettings(payload)
      invalidateSettings()

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page-head">
        <div>
          <h1 className="display">إعدادات المنصة والواجهة</h1>
          <p>جاري تحميل الإعدادات...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">إعدادات المنصة والواجهة</h1>
          <p>التحكم الكامل بالبنرات الإعلانية، التخفيضات، الشرائح المتحركة، وبيانات المتجر</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-brass"
          disabled={saving}
          style={{ minWidth: 160 }}
        >
          {saved ? 'تم الحفظ بنجاح ✓' : saving ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* 1. Promo Strip Banner Manager (نهاية الموسم -30%) */}
        <div className="admin-card" style={{ border: '2px solid var(--brass)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--ink)' }}>🏷️ شريط التخفيضات والعروض (بنل "نهاية الموسم")</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                هذا هو الشريط العريض الذي يظهر في الصفحة الرئيسية أعلى التذييل.
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--parchment)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <input
                type="checkbox"
                checked={promoEnabled}
                onChange={(e) => setPromoEnabled(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{promoEnabled ? 'مفعّل بالرئيسية' : 'معطّل (مخفي)'}</span>
            </label>
          </div>

          {/* Live Preview Box */}
          <div style={{ margin: '14px 0 20px', padding: 14, background: '#f8f8f8', borderRadius: 12, border: '1px dashed var(--line)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 600 }}>
              👁️ معاينة حية ومباشرة للشريط كما يظهر للزبون:
            </div>
            {promoEnabled ? (
              <div
                style={{
                  background: promoBg || '#8B2E1F',
                  color: '#fff',
                  borderRadius: 14,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, fontFamily: 'inherit' }}>
                    {promoTitle || 'نهاية الموسم'}
                  </h4>
                  {promoText && (
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>
                      {promoText}
                    </p>
                  )}
                </div>
                {promoDiscount && (
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      letterSpacing: '-0.5px',
                      background: 'rgba(255,255,255,0.15)',
                      padding: '8px 16px',
                      borderRadius: 10,
                      backdropFilter: 'blur(4px)',
                      direction: 'ltr',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {promoDiscount}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', background: '#eee', borderRadius: 10 }}>
                ⚠️ تم إخفاء الشريط (لن يظهر في الصفحة الرئيسية)
              </div>
            )}
          </div>

          <div className="pf-row">
            <div className="pf-field">
              <label>العنوان الرئيسي للبنل</label>
              <input
                type="text"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="مثال: نهاية الموسم"
              />
            </div>
            <div className="pf-field">
              <label>نسبة الخصم أو الشارة (Discount Badge)</label>
              <input
                type="text"
                value={promoDiscount}
                onChange={(e) => setPromoDiscount(e.target.value)}
                placeholder="مثال: ٪٣٠- أو خصم خاص"
              />
            </div>
          </div>

          <div className="pf-row">
            <div className="pf-field">
              <label>الوصف الترويجي الفرعي</label>
              <input
                type="text"
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                placeholder="مثال: على قطع مختارة من التشكيلة الصيفية والشتوية للجملة"
              />
            </div>
            <div className="pf-field">
              <label>الرابط عند النقر (Link URL)</label>
              <input
                type="text"
                value={promoLink}
                onChange={(e) => setPromoLink(e.target.value)}
                placeholder="/catalog أو /catalog?cat=رجالي"
              />
            </div>
          </div>

          <div className="pf-field">
            <label>لون خلفية الشريط (Color)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="color"
                value={promoBg}
                onChange={(e) => setPromoBg(e.target.value)}
                style={{ width: 48, height: 40, border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', padding: 0 }}
              />
              <input
                type="text"
                value={promoBg}
                onChange={(e) => setPromoBg(e.target.value)}
                placeholder="#8B2E1F"
                style={{ flex: 1, fontFamily: 'monospace', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: 'عنابي', hex: '#8B2E1F' },
                  { label: 'كحلي', hex: '#1B2A4A' },
                  { label: 'أخضر تيل', hex: '#1E4238' },
                  { label: 'ذهبي', hex: '#A87932' },
                  { label: 'فحمي', hex: '#222222' }
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPromoBg(c.hex)}
                    style={{
                      background: c.hex,
                      color: '#fff',
                      border: promoBg === c.hex ? '2px solid #000' : 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Flash Sale Banner Controls */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0 }}>⚡ بنر العروض الخاطفة والعد التنازلي (Flash Sale)</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                شريط العد التنازلي الحماسي الذي يظهر أعلى المنتجات بالرئيسية
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--parchment)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <input
                type="checkbox"
                checked={flashSaleEnabled}
                onChange={(e) => setFlashSaleEnabled(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{flashSaleEnabled ? 'مفعّل' : 'معطّل'}</span>
            </label>
          </div>

          <div className="pf-row">
            <div className="pf-field">
              <label>عنوان العرض الخاطف</label>
              <input
                type="text"
                value={flashSaleTitle}
                onChange={(e) => setFlashSaleTitle(e.target.value)}
                placeholder="مثال: عروض الخاطفة الجملة — الساعات الأخيرة"
              />
            </div>
            <div className="pf-field">
              <label>شارة الخصم</label>
              <input
                type="text"
                value={flashSaleDiscount}
                onChange={(e) => setFlashSaleDiscount(e.target.value)}
                placeholder="مثال: خصم ٣٥٪-"
              />
            </div>
          </div>
        </div>

        {/* 3. Announcement Bar Controls */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>📢 الشريط الإعلاني العلوي (أعلى الموقع)</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--parchment)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <input
                type="checkbox"
                checked={announceEnabled}
                onChange={(e) => setAnnounceEnabled(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{announceEnabled ? 'مفعّل' : 'معطّل'}</span>
            </label>
          </div>

          <div className="pf-field">
            <label>نص الشريط الإعلاني</label>
            <input
              type="text"
              value={announceText}
              onChange={(e) => setAnnounceText(e.target.value)}
              placeholder="مثال: توصيل لجميع محافظات العراق · الدفع عند الاستلام"
            />
          </div>
        </div>

        {/* 4. Hero Banner Carousel Manager */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>🖼️ البانرات والشرائح المتحركة الكبرى (Hero Carousel)</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '4px 0 0' }}>إدارة الشرائح الدوارة في واجهة المتجر</p>
            </div>
            <button type="button" className="btn btn-ghost" onClick={addSlide}>
              + إضافة شريحة جديدة
            </button>
          </div>

          {heroSlides.map((slide, i) => (
            <div
              key={i}
              style={{
                background: 'var(--parchment)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong style={{ fontSize: 14, color: 'var(--ink)' }}>شريحة رقم #{i + 1}</strong>
                {heroSlides.length > 1 && (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => removeSlide(i)}
                    style={{ fontSize: 12, cursor: 'pointer' }}
                  >
                    حذف الشريحة ×
                  </button>
                )}
              </div>

              <div className="pf-row">
                <div className="pf-field">
                  <label>العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) => updateSlide(i, 'title', e.target.value)}
                    placeholder="مثال: تخفيضات الشتاء الكبرى"
                  />
                </div>
                <div className="pf-field">
                  <label>الشارة العلوية (Badge)</label>
                  <input
                    type="text"
                    value={slide.tag || ''}
                    onChange={(e) => updateSlide(i, 'tag', e.target.value)}
                    placeholder="مثال: تخفيض 25%"
                  />
                </div>
              </div>

              <div className="pf-row">
                <div className="pf-field">
                  <label>الوصف الفرعي</label>
                  <input
                    type="text"
                    value={slide.desc || ''}
                    onChange={(e) => updateSlide(i, 'desc', e.target.value)}
                    placeholder="وصف مختصر للعرض..."
                  />
                </div>
                <div className="pf-field">
                  <label>نص الزر والرابط</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={slide.cta || ''}
                      onChange={(e) => updateSlide(i, 'cta', e.target.value)}
                      placeholder="نص الزر (تسوّق الآن)"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={slide.to || ''}
                      onChange={(e) => updateSlide(i, 'to', e.target.value)}
                      placeholder="الرابط (/catalog)"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div className="pf-field">
                <label>صورة خلفية البانر (رابط الصورة أو اختيار ملف)</label>
                <input
                  type="text"
                  value={slide.bg_url || ''}
                  onChange={(e) => updateSlide(i, 'bg_url', e.target.value)}
                  placeholder="https://example.com/hero-bg.jpg"
                  style={{ marginBottom: 6 }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSlideImageUpload(i, e.target.files?.[0])}
                  style={{ fontSize: 12 }}
                />
                {slide.bg_url && (
                  <div style={{ marginTop: 8, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    <img src={slide.bg_url} alt="معاينة البانر" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 5. WhatsApp & Contact */}
        <div className="admin-card">
          <h3>💬 معلومات التواصل والواتساب</h3>
          <div className="pf-field">
            <label>رقم واتساب استقبال الطلبات (بصيغة دولية بدون +)</label>
            <input
              type="text"
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="9647801234567"
            />
          </div>
        </div>

        {/* 6. About & Return Policy */}
        <div className="admin-card">
          <h3>📄 معلومات المتجر والسياسات</h3>
          <div className="pf-field">
            <label>عن المنصة (من نحن)</label>
            <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={3} />
          </div>
          <div className="pf-field">
            <label>سياسة الإرجاع والاستبدال</label>
            <textarea value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} rows={3} placeholder="اكتب سياسة الإرجاع هنا..." />
          </div>
        </div>

        <div style={{ position: 'sticky', bottom: 20, zIndex: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '14px 20px', borderRadius: 14, border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {saved ? '✅ تم تطبيق وحفظ كافة التعديلات بنجاح!' : 'تأكد من الضغط على زر الحفظ لتطبيق التغييرات على المتجر مباشرة.'}
          </span>
          <button type="submit" className="btn btn-brass" disabled={saving} style={{ minWidth: 180, fontWeight: 700 }}>
            {saved ? 'تم الحفظ بنجاح ✓' : saving ? 'جاري الحفظ...' : 'حفظ كافة الإعدادات'}
          </button>
        </div>
      </form>
    </>
  )
}
