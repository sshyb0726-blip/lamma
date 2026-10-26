# تطبيق الحلويات المغربية (PWA)

تطبيق ويب كيتثبت فالهاتف بحال تطبيق عادي. كلشي مجاني فالبداية.

## الملفات
- `index.html`، `styles.css`، `app.js`: التطبيق
- `config.js`: فين كتحط معلومات Supabase
- `supabase.sql`: إنشاء الجداول والصلاحيات
- `sw.js`: التحديث الأوتوماتيك
- `manifest.webmanifest`: باش يتثبت كتطبيق

## الخطوة 1: جرب التطبيق (بلا حساب)
حل `index.html` فالمتصفح. كيخدم بوضع التجربة بمنتجات وهمية.

## الخطوة 2: GitHub
1. سجل فـ github.com وسوّب Repository جديد (Public أو Private).
2. دوز "uploading an existing file" وجر كلشي ملفات هاد المجلد (مع مجلد `icons`)، وضغط Commit.

## الخطوة 3: Supabase (قاعدة البيانات)
1. سجل فـ supabase.com وسوّب Project جديد.
2. SQL Editor > New query > انسخ `supabase.sql` كامل > Run.
3. Authentication > Providers > Email: طفي "Confirm email" (للبداية).
4. Project Settings > API: نسخ **Project URL** و**anon public key**.
5. فـ GitHub بدل `config.js` وحط القيمتين فـ `SUPABASE_URL` و`SUPABASE_ANON_KEY`.

## الخطوة 4: النشر المجاني (Cloudflare Pages)
1. سجل فـ cloudflare.com > Workers & Pages > Create > Pages > Connect to Git.
2. اختار الـ Repository. Build command: خليه خاوي. Output directory: `/`.
3. Deploy. غادي يعطيك رابط. كل تعديل كتدير فـ GitHub كيتنشر وحدو.

## بعد النشر
- فتحو فالهاتف > "Add to Home screen" باش يتثبت.
- للتحديث: بدل الملف فـ GitHub وكيوصل لكل المستعملين أوتوماتيك.
- Google Play: فيما بعد بـ PWABuilder.

## نقط خاصك تبدلها
- `APP_NAME` فـ `config.js` و`<title>` فـ `index.html` و`name` فـ `manifest.webmanifest`.
- رقم الواتساب ديال البائعة كيتحفظ فالتسجيل وكيبان للزبناء.
