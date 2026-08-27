import { Link } from 'react-router-dom'
import { WhatsAppIcon } from './icons.jsx'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="fname display">درازن</div>
          <p className="fdesc">جملة الملابس بجودة عالية لكل محافظات العراق. نجمع أفضل مصادر الجملة في مكان واحد.</p>
          <a className="wa-btn" href="#">
            <WhatsAppIcon width={16} height={16} />
            تواصل عبر واتساب
          </a>
        </div>
        <div className="footer-col">
          <h5>تصفح</h5>
          <Link to="/catalog?cat=رجالي">رجالي</Link>
          <Link to="/catalog?cat=نسائي">نسائي</Link>
          <Link to="/catalog?cat=أطفال">أطفال</Link>
          <Link to="/catalog?cat=فساتين">فساتين</Link>
        </div>
        <div className="footer-col">
          <h5>خدمة العملاء</h5>
          <a href="#">سياسة الإرجاع</a>
          <a href="#">التوصيل والدفع</a>
          <a href="#">تواصل معنا</a>
        </div>
      </div>
      <div className="copyright">© ٢٠٢٦ درازن — جميع الحقوق محفوظة</div>
    </footer>
  )
}

export function MiniFooter() {
  return (
    <footer className="mini-footer">
      <div className="fname display">درازن</div>
      <p>جملة الملابس بجودة عالية لكل العراق</p>
    </footer>
  )
}
