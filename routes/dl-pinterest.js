const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

/**
 * دالة لجلب روابط التحميل من Pinterest باستخدام savepin.app
 */
async function fetchPinterestMedia(url) {
    try {
        console.log(`🔍 جاري جلب الوسائط من Pinterest: ${url}`);

        const response = await axios.get(`https://www.savepin.app/download.php?url=${url}&lang=en&type=redirect`);
        const $ = cheerio.load(response.data);
        const results = [];

        const mediaTable = $("table").has('tr:contains("Quality")').first();

        if (mediaTable.length) {
            mediaTable.find("tr").each((index, element) => {
                const quality = $(element).find(".video-quality").text().trim();
                const format = $(element).find("td:nth-child(2)").text().trim();
                let downloadLink = $(element).find("a").attr("href");

                if (quality && downloadLink) {
                    downloadLink = downloadLink.startsWith("http")
                        ? downloadLink
                        : `https://www.savepin.app${downloadLink}`;
                    downloadLink = decodeURIComponent(downloadLink.replace("https://www.savepin.appforce-save.php?url=", ""));

                    results.push({
                        quality,
                        format,
                        media: downloadLink,
                    });
                }
            });
        } else {
            console.warn(`⚠️ لم يتم العثور على أي وسائط قابلة للتحميل من: ${url}`);
            return { message: "لم يتم العثور على أي وسائط قابلة للتحميل." };
        }

        console.log(`✅ تم استخراج ${results.length} من الوسائط بنجاح`);
        return { results };
    } catch (error) {
        console.error(`❌ خطأ أثناء جلب الوسائط من Pinterest: ${error.message}`);
        return { error: "حدث خطأ أثناء جلب البيانات: " + error.message };
    }
}

/**
 * نقطة نهاية API لجلب الوسائط من Pinterest
 */
router.get("/pinterest", async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: "❌ يرجى تقديم رابط Pinterest باستخدام ?url=",
            });
        }

        const data = await fetchPinterestMedia(url);

        if (data.error) {
            return res.status(500).json({
                error: `❌ ${data.error}`,
            });
        }

        res.status(200).json({
            message: "📥 تم استخراج الروابط بنجاح",
            results: data.results,
        });
    } catch (error) {
        console.error(`❌ خطأ أثناء معالجة الطلب: ${error.message}`);
        res.status(500).json({
            error: `❌ حدث خطأ: ${error.message}`,
        });
    }
});

// تصدير الموديل وفقًا للصيغة المعتمدة لديك
module.exports = {
    path: "/api/download",
    name: "Pinterest-dl",
    type: "download",
    url: `${global.t}/api/download/pinterest?url=رابط_Pinterest_هنا`,
    logo: "https://files.catbox.moe/vrznog.jpg",
    router,
};