const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * دالة لجلب حالة الطقس باستخدام wttr.in
 * @param {string} city - اسم المدينة
 * @returns {Object} - كائن يحتوي على الطقس ودرجة الحرارة
 */
async function getWeather(city) {
    try {
        console.log(`🔍 جارٍ جلب حالة الطقس لمدينة: ${city}`);
        const response = await axios.get(`https://wttr.in/${city}?format=%C+%t`);
        const weatherData = response.data.split(" ");

        return {
            city,
            weather: weatherData[0] || "غير متوفر",
            temperature: weatherData[1] || "غير متوفر",
        };
    } catch (error) {
        console.error(`❌ خطأ أثناء جلب الطقس: ${error.message}`);
        return { error: "حدث خطأ أثناء جلب الطقس. حاول مرة أخرى لاحقًا." };
    }
}

/**
 * نقطة نهاية للحصول على حالة الطقس
 */
router.get("/weather", async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                error: "❌ يرجى تقديم اسم المدينة باستخدام ?city=",
            });
        }

        const data = await getWeather(city);

        if (data.error) {
            return res.status(500).json({
                error: `❌ ${data.error}`,
            });
        }

        res.status(200).json({
            message: "📥 تم جلب حالة الطقس بنجاح",
            results: data,
        });
    } catch (error) {
        console.error(`❌ خطأ أثناء معالجة الطلب: ${error.message}`);
        res.status(500).json({
            error: `❌ حدث خطأ: ${error.message}`,
        });
    }
});

// تصدير الـ API بالصيغة الموحدة
module.exports = {
    path: "/api/weather",
    name: "Weather API",
    type: "tools",
    url: `${global.t}/api/weather/weather?city=Riyadh`,
    logo: "https://files.catbox.moe/j5vt6s.jpg",
    router,
};