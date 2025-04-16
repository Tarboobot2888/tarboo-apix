const express = require('express');
const router = express.Router();

/**
 * دالة للبحث عن روابط الصور من Pinterest
 * @param {string} query - مصطلح البحث عن الصور
 * @returns {Array} - قائمة بروابط الصور
 */
async function fetchPinterestImages(query) {
    const got = (await import('got')).default;

    console.log(`🔍 جاري البحث عن صور على Pinterest باستخدام الاستعلام: ${query}`);

    const response = await got(`https://www.pinterest.com/search/pins/?q=${query}`, {
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'https://www.pinterest.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
    });

    // استخراج روابط الصور من البيانات المسترجعة
    const matches = response.body.match(/https:\/\/i\.pinimg\.com\/originals\/[^"]+\.(jpg|png|jpeg)/g);
    return matches ? [...new Set(matches)] : [];
}

/**
 * نقطة النهاية للبحث عن الصور في Pinterest
 */
router.get('/pin-img', async (req, res) => {
    const { q: query } = req.query;

    if (!query) {
        return res.status(400).json({
            error: '❌ الرجاء تحديد استعلام البحث باستخدام ?q=',
        });
    }

    try {
        const images = await fetchPinterestImages(query);

        if (!images.length) {  
            return res.status(404).json({  
                error: '❌ لم يتم العثور على صور.',  
            });  
        }  

        res.status(200).json({  
            message: '📥 تم جلب الصور بنجاح',  
            results: {  
                query,  
                images,  
                source: 'Pinterest',  
                owner: 'EDMOND',  
            },  
        });

    } catch (error) {
        console.error('❌ خطأ أثناء استرجاع الصور:', error.message);
        res.status(500).json({
            error: '⚠️ حدث خطأ أثناء استرجاع الصور. الرجاء المحاولة مرة أخرى لاحقًا.',
        });
    }
});

// تصدير الـ API بالشكل الموحد
module.exports = {
    path: '/api/search',
    name: 'Pinterest-Image',
    type: 'search',
    url: `${global.t}/api/search/pin-img?q=nature`,
    logo: 'https://files.catbox.moe/yunuyf.jpg',
    router,
};