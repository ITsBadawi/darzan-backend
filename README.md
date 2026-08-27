# 🛍️ منصة درازن (Darzan) — المنصة الموحدة المتكاملة للإنتاج

منصة متكاملة لتجارة الملابس بالجملة بنظام B2B، مبنية بأحدث التقنيات وبأعلى معايير الأداء والسرعة والأمان، ومجهزة للنشر السحابي والتشغيل الفوري في بيئة الإنتاج.

---

## ⚡ البنية التقنية (Tech Stack)

- **الواجهة الأمامية (Frontend)**: React 18 + Vite + React Router + Zustand (Mobile-First UI & Luxury Design System).
- **الخادم والـ API (Backend)**: Node.js + Express + Helmet + CORS + Rate Limiting.
- **قاعدة البيانات والمصادقة (Database & Auth)**: Supabase PostgreSQL + Row Level Security (RLS) + Supabase Storage + JWT Auth.
- **النشر والتشغيل (Deployment)**: حاوية Docker متعددة المراحل جاهزة لـ Railway / Render / VPS.

---

## 📁 هيكلية المشروع الموحد (Project Structure)

```
darzan/
├── package.json               # أوامر البناء والتشغيل الموحدة
├── .env.example               # نموذج متغيرات البيئة
├── .gitignore                 # ملف الاستثناءات للإنتاج
├── Dockerfile                 # حاوية الإنتاج الموحدة
├── railway.json               # ملف إعدادات النشر السحابي (Railway)
├── README.md                  # دليل التشغيل والرفع
├── src/                       # كود الخادم وقاعدة البيانات (Backend)
│   ├── config/
│   │   └── supabase.js        # إعداد الاتصال الإنتاجي بـ Supabase
│   ├── controllers/           # معالجات الطلبات والمنطق البرمجي
│   │   ├── adminController.js
│   │   ├── adminProductsController.js
│   │   ├── authController.js
│   │   ├── ordersController.js
│   │   ├── productsController.js
│   │   ├── settingsController.js
│   │   └── uploadController.js
│   ├── db/                    # مخططات وهجرة قاعدة البيانات
│   │   ├── migration.sql      # الجداول، الدوال، الحماية RLS، والتريغرز
│   │   └── seed.sql           # البيانات والإعدادات التأسيسية
│   ├── middleware/            # طبقات التحقق والحماية وإدارة الأخطاء
│   ├── routes/                # مسارات الـ API (Auth, Products, Orders, Admin, Settings, Upload)
│   ├── utils/                 # دوال مساعدة (توليد أرقام الطلبات، التحقق من المدخلات)
│   └── index.js               # نقطة الدخول الرئيسية للخادم وتقديم الواجهة المدمجة
└── client/                    # مشروع الواجهة الأمامية الكامل (Frontend React + Vite)
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx            # توجيه الصفحات وحماية لوحة الإدارة
        ├── main.jsx           # نقطة بدء تطبيق React
        ├── admin/             # لوحة الإدارة الكاملة (Dashboard, Orders, Products, Categories, Settings)
        ├── components/        # جميع مكونات الواجهة التفاعلية
        ├── data/              # ثوابت المتجر ودوال مصفوفة الـ SKU
        ├── lib/
        │   └── api.js         # عميل الـ HTTP الموحد
        ├── pages/             # الصفحات الرئيسية للمتجر (Home, Catalog, Product, Cart, Checkout, Favorites)
        ├── store/             # إدارة الحالة عبر Zustand
        └── styles/            # نظام التصميم والمتغيرات البصرية (Tokens & CSS)
```

---

## 🚀 خطوات النشر والتشغيل (Deployment Guide)

### الخطوة 1: إعداد قاعدة البيانات في Supabase
1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com).
2. ادخل إلى **SQL Editor** وشغّل ملف `src/db/migration.sql` لإنشاء كافة الجداول وصلاحيات الحماية (RLS).
3. (اختياري) شغّل ملف `src/db/seed.sql` لتهيئة المنتجات الأساسية.
4. ادخل إلى **Authentication > Users** وأنشئ مستخدم المدير (Admin).
5. لتعيين صلاحية المدير للمستخدم، نفّذ الأمر التالي في **SQL Editor**:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
   ```

### الخطوة 2: المتغيرات البيئية (Environment Variables)
انسخ `.env.example` إلى `.env` واملأ المفاتيح الخاصة بك من لوحة Supabase:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=production
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### الخطوة 3: التشغيل المحلي (Local Development)

```bash
# تثبيت كافة الاعتماديات
npm install
npm install --prefix client

# بناء الواجهة
npm run build

# تشغيل الخادم والواجهة المدمجة معاً
npm start
```
سيعمل التطبيق كاملاً (الواجهة + الـ API) على الرابط: `http://localhost:3001`

لتشغيل وضع التطوير المباشر مع الـ Hot-Reload:
```bash
# في نافذة Terminal للخادم
npm run dev

# في نافذة Terminal أخرى للواجهة
npm run dev:client
```

### الخطوة 4: الرفع إلى السحابة (Railway / Render / VPS)
- **Railway**: قم بربط مستودع الـ GitHub مباشرة، سيقوم Railway بقراءة `railway.json` وتنفيذ `npm run build` ثم `npm start` تلقائياً. أضف المتغيرات البيئية في تبويب Variables.
- **Docker**: قم ببناء وتشغيل الحاوية بأمر واحد:
  ```bash
  docker build -t darzan-app .
  docker run -p 3001:3001 --env-file .env darzan-app
  ```

---

## 🔒 الميزات الأمنية المطبقة
- حماية الهيدرز عبر **Helmet**.
- تحديد معدل الطلبات عبر **Rate Limiter** لحماية الـ API ونموذج تسجيل الدخول من هجمات Brute Force.
- توثيق وتشفير جلسات الإدارة عبر **Supabase JWT + Refresh Tokens**.
- عزل وتشفير بيانات قاعدة البيانات بواسطة سياسات **Row Level Security (RLS)**.
