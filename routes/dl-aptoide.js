const express = require('express');
const { search, download } = require('aptoide-scraper');

const router = express.Router();

router.get('/aptoide', async (req, res) => {
  try {
    const query = req.query.q; // اسم التطبيق المطلوب
    if (!query) {
      return res.status(400).json({ error: 'الرجاء تقديم اسم التطبيق باستخدام ?q=' });
    }

    const results = await search(query); // البحث عن التطبيق
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على أي تطبيقات.' });
    }

    // جلب جميع بيانات التطبيق لكل نتيجة بحث
    const appsWithDetails = await Promise.all(
      results.map(async (app) => {
        try {
          const appData = await download(app.id); // جلب جميع المعلومات المتاحة
          return {
            name: app.name,
            packageId: app.id,
            icon: app.icon,
            ...appData, // تضمين جميع بيانات التطبيق المسترجعة
          };
        } catch (error) {
          console.error(`خطأ أثناء جلب بيانات التطبيق ${app.id}:`, error.message);
          return {
            name: app.name,
            packageId: app.id,
            icon: app.icon,
            error: 'فشل في جلب بيانات التطبيق.',
          };
        }
      })
    );

    // إرسال البيانات النهائية
    res.status(200).json({
      query,
      results: appsWithDetails,
    });
  } catch (error) {
    console.error('خطأ أثناء البحث:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء البحث. حاول مرة أخرى لاحقًا.' });
  }
});

module.exports = {
    path: '/api/download',
    name: 'APTOIDE',
    type: 'download',
    url: `${global.t}/api/download/aptoide?q=whatsapp`,
    logo: 'https://k.top4top.io/p_3352sgz0g0.jpg',
    router,
};
