const express = require('express');
const axios = require('axios');
const cors = require('cors');

const router = express.Router();

router.use(cors()); // للسماح بالطلبات من أي مصدر
router.use(express.json()); // لدعم البيانات بصيغة JSON

// دالة لاختصار الروابط باستخدام TinyURL
async function shortenUrl(url) {
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    return response.data; // إرجاع الرابط المختصر
  } catch (error) {
    console.error('Error shortening URL:', error.message);
    return url; // في حالة الفشل، يتم إرجاع الرابط الأصلي
  }
}

// دالة البحث عن التطبيقات عبر اسم التطبيق
async function fetchApps(query) {
  try {
    const headers = {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'fr-FR,fr;q=0.5',
      'referer': `https://apkpure.com/fr/search?q=${query}`,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    };

    const url = `https://apkpure.net/api/v1/search_suggestion_new?key=${query}&limit=20`;
    const response = await axios.get(url, { headers });

    const apps = response.data.filter(app => app.packageName); // تصفية التطبيقات فقط

    // تقصير الروابط لكل تطبيق
    const results = await Promise.all(apps.map(async (app) => {
      const directDownload = `https://d.apkpure.com/b/APK/${app.packageName}?version=latest`;
      const shortUrl = await shortenUrl(directDownload);

      return {
        name: app.title,
        package: app.packageName,
        icon: app.icon,
        downloads: app.installTotal,
        rating: app.score,
        version: app.version,
        size: app.fileSize,
        downloadLink: app.fullDownloadUrl,
        directDownload: shortUrl
      };
    }));

    return results;
  } catch (error) {
    console.error('Error fetching apps:', error.message);
    throw error;
  }
}

// **إنشاء مسار API** للبحث عن التطبيقات
router.get('/apkpure', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "يرجى إدخال كلمة البحث في المعامل 'q'" });
  }

  try {
    // التحقق مما إذا كان الإدخال رابط تحميل مباشر
    const match = query.match(/https:\/\/d\.apkpure\.com\/b\/APK\/([^?]+)/);
    if (match) {
      const packageName = match[1]; // استخراج اسم الباكيج من الرابط
      const shortUrl = await shortenUrl(query);
      return res.json({
        name: "غير متاح",
        package: packageName,
        icon: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Android_O_Preview_Logo.png",
        downloads: "غير متاح",
        rating: "غير متاح",
        version: "غير متاح",
        size: "غير متاح",
        downloadLink: query,
        directDownload: shortUrl
      });
    }

    // البحث عن التطبيقات عبر اسم التطبيق
    const results = await fetchApps(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
});

// تشغيل السيرفر
module.exports = {
  path: '/api/search',
  name: 'APKPURE',
  type: 'search',
  url: `${global.t}/api/search/apkpure?q=whatsapp`,
  logo: 'https://j.top4top.io/p_335478mll0.jpg',
  router,
};