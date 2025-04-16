const express = require('express');

const router = express.Router();

/**
 * دالة للبحث عن روابط الفيديوهات من Pinterest
 * @param {string} query - مصطلح البحث عن الفيديوهات
 * @returns {Array} - قائمة بروابط الفيديوهات
 */
async function fetchPinterestVideos(query) {
    const got = (await import('got')).default;

    console.log(`🔍 جاري البحث عن فيديوهات على Pinterest باستخدام الاستعلام: ${query}`);

    const response = await got(`https://www.pinterest.com/search/videos/?q=${query}&rs=content_type_filter`, {
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'https://id.pinterest.com/',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        }
    });

    const matches = response.body.match(/https:\/\/v1\.pinimg\.com\/videos\/mc\/720p\/[^"]+\.mp4/g);
    return matches ? [...new Set(matches)] : [];
}

/**
 * نقطة النهاية للبحث عن الفيديوهات في Pinterest
 */
router.get('/pin-vid', async (req, res) => {
    const { q: query } = req.query;

    if (!query) {
        return res.status(400).json({
            error: '❌ الرجاء تحديد استعلام البحث باستخدام ?q=',
        });
    }

    try {
        const videos = await fetchPinterestVideos(query);

        if (!videos.length) {
            return res.status(404).json({
                error: '❌ لم يتم العثور على فيديوهات.',
            });
        }

        res.status(200).json({
            message: '📥 تم جلب الفيديوهات بنجاح',
            results: {
                query,
                videos,
                source: 'Pinterest',
                owner: 'EDMOND',
            },
        });
    } catch (error) {
        console.error('❌ خطأ أثناء استرجاع الفيديوهات:', error.message);
        res.status(500).json({
            error: '⚠️ حدث خطأ أثناء استرجاع الفيديوهات. الرجاء المحاولة مرة أخرى لاحقًا.',
        });
    }
});

// تصدير الـ API بالشكل الموحد
module.exports = {
    path: '/api/search',
    name: 'Pinterest-Video',
    type: 'search',
    url: `${global.t}/api/search/pin-vid?q=nature`,
    logo: 'https://files.catbox.moe/yunuyf.jpg',
    router,
};