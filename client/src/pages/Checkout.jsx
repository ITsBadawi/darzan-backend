import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore, selectCartTotal } from '../store/useCartStore.js'
import { useProductsStore } from '../store/useProductsStore.js'
import { useOrdersStore } from '../store/useOrdersStore.js'
import { useSettingsStore } from '../store/useSettingsStore.js'
import { WhatsAppIcon, CheckIcon } from '../components/icons.jsx'
import './Checkout.css'

// WhatsApp support number — fetched from settings or fallback
const FALLBACK_PHONE = '9647801234567'

const PROVINCES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'ديالى',
  'ذي قار', 'بابل', 'واسط', 'ميسان', 'القادسية', 'المثنى', 'صلاح الدين', 'كركوك', 'دهوك', 'السليمانية'
]

export default function Checkout() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore(selectCartTotal)
  const clear = useCartStore((s) => s.clear)
  const createOrder = useOrdersStore((s) => s.createOrder)
  const products = useProductsStore((s) => s.products)
  const fetchProducts = useProductsStore((s) => s.fetchProducts)

  const fetchSettings = useSettingsStore((s) => s.fetchPublicSettings)
  const settings = useSettingsStore((s) => s.settings)

  const [form, setForm] = useState({ name: '', phone: '', province: '', address: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [sentOrder, setSentOrder] = useState(null)
  const [sending, setSending] = useState(false)
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    document.title = 'درازن | إتمام الطلب'
    fetchSettings()
    if (products.length === 0) {
      fetchProducts()
    }
  }, [fetchSettings, products.length, fetchProducts])

  const supportPhone = settings?.whatsapp_number || FALLBACK_PHONE

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const next = {
      name: form.name.trim().length < 3,
      phone: !/^0?7[0-9]{9}$/.test(form.phone.trim()),
      province: form.province === '',
      address: form.address.trim().length < 5
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  async function handleSend() {
    if (!validate()) return
    setSending(true)
    setApiError(null)

    try {
      // Direct order creation via API / Database (triggers Telegram notification on backend)
      const res = await createOrder({
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        province: form.province.trim(),
        address: form.address.trim(),
        notes: form.notes?.trim() || '',
        items: items.map((item) => ({
          product_id: item.productId || item.product_id || null,
          sku_id: item.sku_id || null,
          product_name: item.name || item.product_name,
          color_name: item.colorName || item.color_name,
          color_hex: item.colorHex || item.color_hex,
          g1: item.g1,
          g2: item.g2,
          size: item.size,
          sku_code: item.sku || item.sku_code,
          qty: item.qty,
          unit_price: item.price || item.unit_price
        })),
        total
      })

      const generatedOrderNumber = res?.orderNumber || ('DZN-' + Date.now().toString().slice(-6))

      setSentOrder({
        orderNumber: generatedOrderNumber,
        customerName: form.name.trim(),
        total
      })

      clear()
    } catch (err) {
      console.error('Order submission error:', err)
      setApiError('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="breadcrumb"><Link to="/">الرئيسية</Link> / <Link to="/cart">السلة</Link> / <span className="current">إتمام الطلب</span></div>
      <div className="page-head"><h1 className="display">إتمام الطلب</h1></div>

      {sentOrder ? (
        <div className="co-wrap">
          <div className="success-panel">
            <div className="check"><CheckIcon width={32} height={32} /></div>
            <h2 className="display">تم تسجيل طلبك بنجاح! 🎉</h2>
            <div className="order-badge">رقم الطلب: #{sentOrder.orderNumber}</div>
            <p>
              شكراً لطلبك يا <strong>{sentOrder.customerName}</strong>. تم استلام طلبك في النظام بنجاح، وسيتواصل معك فريق المبيعات والتوصيل هاتفياً لتأكيد الشحن والتسليم.
            </p>
            <div className="success-actions">
              <Link className="btn-primary" to="/catalog">متابعة التسوق</Link>
              <a
                className="btn-secondary-support"
                href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`مرحباً، أود الاستفسار بخصوص طلبي رقم #${sentOrder.orderNumber}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon width={16} height={16} />
                تواصل مع الدعم للاستفسار
              </a>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="co-wrap">
          <div className="success-panel">
            <h2 className="display">لا توجد منتجات في السلة</h2>
            <p>أضف بعض المنتجات أولاً قبل إتمام الطلب</p>
            <Link className="btn-primary" to="/catalog">تصفّح المنتجات</Link>
          </div>
        </div>
      ) : (
        <div className="co-wrap">
          <div className="form-card">
            <h3 className="display">بيانات التوصيل</h3>

            {apiError && (
              <div className="alert-box error" style={{ marginBottom: 16 }}>{apiError}</div>
            )}

            <div className={`field${errors.name ? ' invalid' : ''}`}>
              <label>الاسم الكامل</label>
              <input type="text" placeholder="مثال: أحمد محمد" value={form.name} onChange={(e) => update('name', e.target.value)} />
              <div className="error">فضلاً أدخل اسمك الكامل</div>
            </div>

            <div className="field-row">
              <div className={`field${errors.phone ? ' invalid' : ''}`}>
                <label>رقم الهاتف للتواصل</label>
                <input type="tel" placeholder="07xxxxxxxxx" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                <div className="error">فضلاً أدخل رقم هاتف صحيح</div>
              </div>
              <div className={`field${errors.province ? ' invalid' : ''}`}>
                <label>المحافظة</label>
                <select value={form.province} onChange={(e) => update('province', e.target.value)}>
                  <option value="">اختر المحافظة</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
                <div className="error">فضلاً اختر المحافظة</div>
              </div>
            </div>

            <div className={`field${errors.address ? ' invalid' : ''}`}>
              <label>العنوان بالتفصيل</label>
              <textarea placeholder="المنطقة، الشارع، أقرب نقطة دالة..." value={form.address} onChange={(e) => update('address', e.target.value)} />
              <div className="error">فضلاً أدخل تفاصيل العنوان</div>
            </div>

            <div className="field">
              <label>ملاحظات إضافية (اختياري)</label>
              <textarea placeholder="مثال: يرجى التوصيل صباحاً" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
            </div>
          </div>

          <div className="summary">
            <h3 className="display">ملخص الطلب</h3>
            <div>
              {items.map((item) => {
                const product = products.find((p) => p.id === (item.productId || item.product_id))
                const colorObj = product?.colors?.find((c) => c.name === item.colorName || c.code === item.colorHex)
                const itemImg = item.image || item.image_url || item.cover_image || colorObj?.image_url || product?.cover_image || product?.coverImage || product?.image_url

                return (
                  <div className="sum-item" key={item.lineId}>
                    <div className="thumb">
                      {itemImg ? (
                        <img src={itemImg} alt={item.name} loading="lazy" />
                      ) : (
                        <div
                          className="thumb-fallback"
                          style={{ background: `linear-gradient(150deg, ${item.g1 || '#ddd'} 0%, ${item.g2 || '#bbb'} 100%)` }}
                        />
                      )}
                    </div>
                    <div className="txt">
                      <div className="n">{item.name || item.product_name}</div>
                      <div className="m">{item.colorName || item.color_name} · {item.size} · ×{item.qty}</div>
                    </div>
                    <div className="p">{((item.price || item.unit_price) * item.qty).toLocaleString('ar')} د.ع</div>
                  </div>
                )
              })}
            </div>
            <div className="sum-total"><span>الإجمالي</span><span>{total.toLocaleString('ar')} د.ع</span></div>
            <div className="sum-note">سعر الشحن يُحدّد عند التأكيد حسب المحافظة</div>
            <button className="send-btn" onClick={handleSend} disabled={sending}>
              <CheckIcon width={18} height={18} />
              {sending ? 'جاري تسجيل الطلب...' : 'تأكيد الطلب الآن'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
