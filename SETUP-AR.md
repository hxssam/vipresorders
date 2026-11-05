# دليل التشغيل (مرة واحدة فقط)

## أولاً: إنشاء قاعدة البيانات المجانية (Firebase)
1. افتح https://console.firebase.google.com وسجّل بحساب Google ← **Create a project** ← اكتب اسماً (مثلاً vip-restobar) ← أكمل الخطوات (يمكن تعطيل Google Analytics).
2. من القائمة اليسرى: **Build ← Realtime Database ← Create Database** ← اختر الموقع **europe-west1** ← اختر **Start in locked mode** ← Enable.
3. افتح تبويب **Rules** ← احذف كل ما فيه ← الصق محتوى ملف `firebase-rules.json` كاملاً ← **Publish**.
4. انسخ رابط قاعدة البيانات من أعلى صفحة Data (يشبه `https://vip-restobar-default-rtdb.europe-west1.firebasedatabase.app`).
5. من **Build ← Authentication ← Get started ← Sign-in method ← Email/Password ← Enable ← Save**.
6. من تبويب **Users ← Add user**: البريد **`admin@vip.local`** (اكتبه كما هو تماماً) وكلمة المرور التي تريدها لنفسك.
7. من أيقونة الترس ⚙ ← **Project settings ← General** وانسخ **Web API Key**.
8. افتح ملف `config.js` وضع القيمتين:
   - `dbUrl` = رابط قاعدة البيانات
   - `apiKey` = Web API Key

## ثانياً: النشر على GitHub (مرة واحدة)
1. أنشئ مستودعاً جديداً (أو استخدم القديم) وارفع كل ملفات المجلد (محتوياته).
2. **Settings ← Pages ← Source: Deploy from a branch ← Branch: main / (root) ← Save**.
3. بعد دقيقة يظهر الرابط. افتحه من الجوال وثبّته على الشاشة الرئيسية.

## بعد ذلك لا تحتاج GitHub إطلاقاً
الطباخون، المنتجات، التسميات، الوحدات، الطلبات، والتحضيرات كلها تُعدَّل من داخل التطبيق وتظهر للجميع فوراً.
GitHub يُستخدم فقط إذا أردت تغيير **كود** التطبيق: افتح الملف على GitHub ← أيقونة القلم ← عدّل ← Commit، ويتحدث الموقع تلقائياً.

## كلمة المرور
- تغييرها من داخل التطبيق: ⚙ ← «Сменить пароль».
- نسيتها؟ من Firebase: Authentication ← Users ← القائمة ⋮ بجانب المستخدم ← Reset password. لا يمكن أن تُقفل خارج حسابك.
