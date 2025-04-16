const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/tik-vid', async (req, res) => {
  const query = req.query.q; // استعلام البحث
  if (!query) {
    return res.status(400).json({ error: 'الرجاء تحديد استعلام البحث باستخدام ?q=' });
  }

  try {
    // طلب API لجلب بيانات TikTok
    const response = await axios.get(`https://tikwm.com/api/feed/search`, {
      params: { keywords: query },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/json',
      },
    });

    const data = response.data?.data;

    // تحقق من البيانات
    if (!data || !Array.isArray(data.videos) || data.videos.length === 0) {
      console.log('API Response:', response.data); // للتأكد من الاستجابة
      return res.status(404).json({ error: 'لم يتم العثور على نتائج لهذا البحث.' });
    }

    const videos = data.videos.map((video) => ({
      id: video.video_id,
      title: video.title || 'غير معروف',
      cover: video.cover,
      duration: video.duration || 'غير معروف',
      play_url: video.play,
      author: {
        username: video.author?.unique_id || 'غير معروف',
        nickname: video.author?.nickname || 'غير معروف',
      },
    }));

    res.json({ videos });
  } catch (error) {
    console.error('خطأ أثناء استرجاع البيانات:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء استرجاع البيانات. الرجاء المحاولة مرة أخرى لاحقًا.' });
  }
});

module.exports = {
    path: "/api/search",
    name: "TikTok-video",
    type: "search",
    url: `${global.t}/api/search/tik-vid?q=shanks`,
    logo: "https://files.catbox.moe/75scb9.jpg",
    router,
};