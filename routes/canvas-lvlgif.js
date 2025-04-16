const express = require("express");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

const router = express.Router();
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// تحميل صورة من URL
async function loadImageFromUrl(url) {
    const response = await axios({ url, responseType: "arraybuffer" });
    return loadImage(Buffer.from(response.data));
}

// إنشاء إطارات GIF مع تحسينات بصرية
async function generateFrames(username, level, currXP, needXP, avatarUrl, bgUrl, framesDir) {
    const width = 800, height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const [bgImg, avatarImg] = await Promise.all([loadImageFromUrl(bgUrl), loadImageFromUrl(avatarUrl)]);

    for (let i = 0; i < 30; i++) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bgImg, 0, 0, width, height);

        // 🔥 تأثير التوهج حول الصورة الرمزية
        ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(140, 200, 80, 0, Math.PI * 2, true);
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0; 

        // 📸 قص الصورة الرمزية داخل الدائرة
        ctx.save();
        ctx.beginPath();
        ctx.arc(140, 200, 75, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 65, 125, 150, 150);
        ctx.restore();

        // 🎨 تحسين النصوص وجعلها أكثر وضوحًا
        ctx.fillStyle = "#fff";
        ctx.font = "35px Arial";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;
        ctx.fillText(username, 270, 90);
        ctx.font = "30px Arial";
        ctx.fillText(`Lvl: ${level}`, 270, 140);
        ctx.fillText(`Exp: ${currXP} / ${needXP}`, 270, 190);
        ctx.shadowBlur = 0;

        // 🌟 تحسين شريط الـ EXP
        let barWidth = ((currXP / needXP) * 500) * (i / 30);
        ctx.fillStyle = "#222";
        drawRoundedRect(ctx, 270, 250, 500, 35, 15);

        let gradient = ctx.createLinearGradient(270, 250, 270 + barWidth, 250);
        gradient.addColorStop(0, "#00FF00");
        gradient.addColorStop(0.5, "#FFD700");
        gradient.addColorStop(1, "#FF4500");
        ctx.fillStyle = gradient;
        drawRoundedRect(ctx, 270, 250, barWidth, 35, 15);

        const framePath = path.join(framesDir, `frame_${i}.png`);
        fs.writeFileSync(framePath, canvas.toBuffer("image/png"));
    }
}

// 🖼️ دالة لرسم مستطيل بحواف دائرية
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// 🎬 إنشاء الـ GIF باستخدام ffmpeg
async function createGif(framesDir, outputGifPath) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(path.join(framesDir, "frame_%d.png"))
            .inputOptions(["-framerate 15"])
            .outputOptions(["-vf scale=800:-1", "-loop 0"])
            .toFormat("gif")
            .save(outputGifPath)
            .on("end", resolve)
            .on("error", reject);
    });
}

// 🚀 API لإنشاء الـ GIF المحسن
router.get("/rank-gif", async (req, res) => {
    try {
        const { username, level, currxp, needxp, avatar, background } = req.query;

        if (!username || !level || !currxp || !needxp || !avatar || !background) {
            return res.status(400).json({ error: "❌ يرجى تقديم جميع المعطيات المطلوبة." });
        }

        const tempDir = path.join("/tmp", `gif_${Date.now()}`);
        const framesDir = path.join(tempDir, "frames");
        const outputGifPath = path.join(tempDir, "rank.gif");

        fs.mkdirSync(framesDir, { recursive: true });

        await generateFrames(username, level, currxp, needxp, avatar, background, framesDir);
        await createGif(framesDir, outputGifPath);

        res.setHeader("Content-Type", "image/gif");
        res.sendFile(outputGifPath, () => {
            fs.rmSync(tempDir, { recursive: true, force: true });
        });

    } catch (error) {
        console.error("❌ خطأ أثناء إنشاء الـ GIF:", error.message);
        res.status(500).json({ error: "حدث خطأ أثناء إنشاء الصورة المتحركة. حاول لاحقًا." });
    }
});

module.exports = {
    path: '/api/lvl',
    name: 'lvlup-gif',
    type: 'canvas',
    url: `${global.t}/api/lvl/rank-gif?username=Ali&level=10&currxp=250&needxp=1000&avatar=https://files.catbox.moe/oosmqn.jpg&background=https://files.catbox.moe/r6lscu.jpg`,
    logo: 'https://i.ibb.co/whXjfvg4/uploaded-image.jpg',
    router,
};