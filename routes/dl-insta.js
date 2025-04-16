const express = require("express");
const Instagram = require("../scraper/instagram"); // استيراد الكود الذي قدمته كموديل خارجي

const router = express.Router();

// 📌 مسار لتحميل الفيديوهات من Instagram و Facebook
router.get("/snapsave", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "يرجى تقديم رابط الفيديو (url)." });
    }

    try {
        const result = await Instagram(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب الفيديو.", details: error.message });
    }
});

module.exports = {
    path: '/api/download',
    name: 'snapsave',
    type: 'download',
    url: `${global.t}/api/download/snapsave?url=https://www.instagram.com/reel/DG1shELo72X/?igsh=MWJjeHp1aXN0eHYzYw==`,
    logo: 'https://c.top4top.io/p_3352hswe80.jpg',
    router,
};
