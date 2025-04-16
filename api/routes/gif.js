const express = require("express");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

const router = express.Router();

// تحميل صورة من URL وتحويلها إلى `Image`
async function loadImageFromUrl(url) {
    const response = await axios({ url, responseType: "arraybuffer" });
    return loadImage(Buffer.from(response.data));
}

// إنشاء صورة وإرسالها مباشرةً للمستخدم
async function generateLevelUpImage(username, level, currXP, needXP, avatarUrl, bgUrl, res) {
    const width = 800, height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const [bgImg, avatarImg] = await Promise.all([loadImageFromUrl(bgUrl), loadImageFromUrl(avatarUrl)]);

    // رسم الخلفية
    ctx.drawImage(bgImg, 0, 0, width, height);

    // تأثير التوهج حول الصورة الرمزية
    ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(140, 200, 80, 0, Math.PI * 2, true);
    ctx.fillStyle = "#222";
    ctx.fill();
    ctx.shadowBlur = 0;

    // قص الصورة الرمزية داخل الدائرة
    ctx.save();
    ctx.beginPath();
    ctx.arc(140, 200, 75, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 65, 125, 150, 150);
    ctx.restore();

    // رسم النصوص
    ctx.fillStyle = "#fff";
    ctx.font = "35px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.fillText(username, 270, 90);
    ctx.font = "30px Arial";
    ctx.fillText(`Lvl: ${level}`, 270, 140);
    ctx.fillText(`Exp: ${currXP} / ${needXP}`, 270, 190);
    ctx.shadowBlur = 0;

    // رسم شريط الخبرة
    let barWidth = (currXP / needXP) * 500;
    ctx.fillStyle = "#222";
    ctx.fillRect(270, 250, 500, 35);
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(270, 250, barWidth, 35);

    // إرسال الصورة كـ `image/png` مباشرةً في الاستجابة
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
}

// API لإنشاء الصورة
router.get("/rank-image", async (req, res) => {
    try {
        const { username, level, currxp, needxp, avatar, background } = req.query;

        if (!username || !level || !currxp || !needxp || !avatar || !background) {
            return res.status(400).json({ error: "❌ يرجى تقديم جميع المعطيات المطلوبة." });
        }

        await generateLevelUpImage(username, level, currxp, needxp, avatar, background, res);
    } catch (error) {
        console.error("❌ خطأ أثناء إنشاء الصورة:", error.message);
        res.status(500).json({ error: "حدث خطأ أثناء إنشاء الصورة. حاول لاحقًا." });
    }
});

module.exports = {
    path: '/api/lvl',
    name: 'lvlup-image',
    type: 'canvas',
    url: `${global.t}/api/lvl/rank-image?username=Ali&level=10&currxp=250&needxp=1000&avatar=https://files.catbox.moe/oosmqn.jpg&background=https://files.catbox.moe/r6lscu.jpg`,
    logo: 'https://files.catbox.moe/a1vc2o.png',
    router,
};