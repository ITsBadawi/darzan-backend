# 📘 دليل رفع وتشغيل متجر درازن على Koyeb + Supabase (الخطة المعتمدة) 🚀

هذا الدليل مخصص بالكامل لرفع متجر درازن وتشغيله مجاناً وبأعلى سرعة 24/7 دون توقف باستخدام المنظومة المعتمدة:
1. **قاعدة البيانات والمصادقة:** Supabase (منطقة الشرق الأوسط / فرانكفورت).
2. **سيرفر التطبيق والواجهة الموحدة:** Koyeb (أوروبا / فرانكفورت) — **شغال 24/7 مجاناً بدون نوم**.
3. **مسرّع وحماية النطاق (اختياري):** Cloudflare لتوزيع الكاش داخل مدن الشرق الأوسط.

---

## 🧭 خطوات الرفع خطوة بخطوة (Click-by-Click)

---

### 1️⃣ الخطوة الأولى: إعداد قاعدة البيانات على Supabase

1. ادخل إلى [supabase.com](https://supabase.com) وسجل الدخول مجاناً.
2. اضغط على **New Project**:
   - **Name**: `darzan-db`
   - **Database Password**: (اختر كلمة سر قوية واحتفظ بها).
   - **Region**: اختر **Middle East (Bahrain)** أو **Central EU (Frankfurt)**.
3. بعد اكتمال إنشاء المشروع:
   - اذهب إلى القائمة الجانبية > اضغط على **SQL Editor**.
   - افتح ملف `src/db/migration.sql` من مشروعك، وانسخ كافة محتوياته والصقها في الـ SQL Editor واضغط **Run**. (سيتم إنشاء كافة الجداول وصلاحيات الحماية RLS والتريغرز).
   - (اختياري): انسخ محتوى `src/db/seed.sql` والصقه واضغط **Run` لتهيئة المنتجات الأساسية.
4. الحصول على مفاتيح الاتصال:
   - اذهب إلى **Project Settings (أيقونة الترس)** > **API**.
   - انسخ:
     - **Project URL** (مثال: `https://abcdefgh.supabase.co`)
     - **anon public key** (يبدأ بـ `eyJ...`)
     - **service_role secret key** (يبدأ بـ `eyJ...`)
5. تفعيل مجلد الصور (Storage):
   - اذهب إلى تبويب **Storage** في القائمة الجانبية.
   - اضغط **New Bucket** > سمّه: `product-images` واجعله **Public Bucket** ثم اضغط Save.

---

### 2️⃣ الخطوة الثانية: رفع الكود إلى مستودعك على GitHub

افتح موجه الأوامر (Terminal) داخل مجلد المشروع الموحد `darzan-backend`:

```bash
git init
git add .
git commit -m "Deploy: Darzan unified production build for Koyeb"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/darzan.git
git push -u origin main
```

---

### 3️⃣ الخطوة الثالثة: الرفع المباشر على Koyeb (في دقيقتين)

1. ادخل إلى [koyeb.com](https://koyeb.com) وسجل الدخول بحسابك على GitHub.
2. من لوحة التحكم، اضغط على **Create App** (أو **Create Service**).
3. اختر طريقة النشر: **GitHub**.
4. اختر مستودع مشروعك `darzan`.
5. في صفحة الإعدادات، اضبط الخيارات التالية بدقة:
   - **Deployment method**: اختر **Dockerfile** (سيتعرف تلقائياً على ملف `Dockerfile` المرفق).
   - **Region**: اختر **Frankfurt (fra)** (الأقرب للشرق الأوسط).
   - **Instance Type**: اختر الخطة المجانية **Free (Nano / Eco)**.
   - **Port**: تأكد أن المنفذ مضبوط على `3001` والمسار `/`.
   - **Health Check Path**: `/api/health`.
6. في قسم **Environment Variables** (المتغيرات البيئية)، اضغط **Add Variable** وأضف:
   - `SUPABASE_URL` = (رابط مشروعك في Supabase)
   - `SUPABASE_ANON_KEY` = (المفتاح العام anon)
   - `SUPABASE_SERVICE_ROLE_KEY` = (مفتاح service_role)
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
7. اضغط **Deploy** أسفل الصفحة!
8. سيبدأ Koyeb في بناء المشروع، وخلال دقيقتين ستتغير الحالة إلى **Healthy** وسيعطيك رابطاً عاماً مثل:  
   `https://darzan-yourusername.koyeb.app`

افتح الرابط في متصفحك أو من هاتفك وستجد المتجر ولوحة التحكم يعملان بكفاءة تامة!

---

### 4️⃣ الخطوة الرابعة: تفعيل حساب المدير (Admin)

1. في لوحة Supabase، اذهب إلى **Authentication** > **Users**.
2. اضغط **Add User** > **Create User**:
   - أدخل بريدك الإلكتروني وكلمة المرور.
   - فعّل خيار `Auto Confirm User`.
3. لترقية هذا الحساب ليصبح مديراً بصلاحيات كاملة، اذهب إلى **SQL Editor** في Supabase ونفذ:
   ```sql
   UPDATE profiles 
   SET role = 'admin', full_name = 'مدير درازن' 
   WHERE email = 'your-email@example.com';
   ```
4. افتح رابط موقعك على Koyeb وتوجه لصفحة تسجيل دخول الإدارة:
   `https://darzan-yourusername.koyeb.app/admin/login`
   وادخل بحسابك لتتحكم بالمتجر كاملاً (إضافة منتجات، تعديل أسعار، استلام طلبات، وتغيير رقم الواتساب).

---

### 5️⃣ الخطوة الخامسة (اختيارية): ربط الدومين المخصص وتسريع الشرق الأوسط عبر Cloudflare

إذا اشتريت نطاقاً خاصاً (مثل `darzan.iq` أو `darzan.com`):
1. أضف الدومين في حسابك المجاني على [cloudflare.com](https://cloudflare.com).
2. في لوحة تحكم Koyeb > اذهب لتبويب **Settings** > **Custom Domains** وأضف اسم دومينك.
3. في Cloudflare > اذهب إلى **DNS Settings** وأضف سجل `CNAME` يوجه إلى رابط Koyeb مع تفعيل خيار **Proxied (السحابة البرتقالية)**.
4. النتيجة: موقعك أصبح يعمل على دومينك الخاص، محمي بشهادة SSL مجانية، ويفتح للزبائن في الشرق الأوسط بسرعة البرق عبر مراكز بيانات Cloudflare المحلية في (بغداد، الرياض، دبي، القاهرة، عمان).

---

## 🛠️ ملخص الأوامر للاختبار المحلي قبل الرفع

```bash
# تثبيت الحزم وبناء المشروع
npm run build

# تشغيل المشروع الموحد محلياً
npm start
```
المشروع سيعمل محلياً على: `http://localhost:3001`
