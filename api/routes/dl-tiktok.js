const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * دالة لجلب بيانات الفيديو من TikTok باستخدام TikWM API
 */
async function fetchTikTokVideo(url) {
    try {
        console.log(`🔍 جاري جلب فيديو TikTok من الرابط: ${url}`);
        
        const { data } = await axios.get(`https://tikwm.com/api?url=${encodeURIComponent(url)}`);
        
        if (data?.code === 0) {
            const videoData = data.data;

            // تنسيق البيانات
            return {
                videoId: videoData.id,
                region: videoData.region,
                title: videoData.title || "No title",
                coverUrl: videoData.cover,
                dynamicCoverUrl: videoData.ai_dynamic_cover,
                originCoverUrl: videoData.origin_cover,
                duration: videoData.duration,
                playUrl: videoData.play,
                watermarkUrl: videoData.wmplay,
                size: videoData.size,
                music: {
                    id: videoData.music_info?.id || "",
                    title: videoData.music_info?.title || "",
                    author: videoData.music_info?.author || "",
                    playUrl: videoData.music_info?.play || "",
                    coverUrl: videoData.music_info?.cover || "",
                    duration: videoData.music_info?.duration || 0,
                },
                author: {
                    id: videoData.author?.id || "",
                    uniqueId: videoData.author?.unique_id || "",
                    nickname: videoData.author?.nickname || "",
                    avatarUrl: videoData.author?.avatar || "",
                },
                stats: {
                    playCount: videoData.play_count,
                    diggCount: videoData.digg_count,
                    commentCount: videoData.comment_count,
                    shareCount: videoData.share_count,
                    downloadCount: videoData.download_count,
                },
            };
        } else {
            console.warn(`⚠️ استجابة غير صالحة من TikWM API للرابط: ${url}`);
            return { error: "استجابة غير صالحة من TikWM API." };
        }
    } catch (error) {
        console.error(`❌ خطأ أثناء جلب فيديو TikTok: ${error.message}`);
        return { error: "حدث خطأ أثناء جلب البيانات: " + error.message };
    }
}

/**
 * نقطة نهاية API لجلب بيانات فيديو TikTok
 */
router.get("/tik", async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: "❌ يرجى تقديم رابط TikTok باستخدام ?url=",
            });
        }

        const data = await fetchTikTokVideo(url);

        if (data.error) {
            return res.status(500).json({
                error: `❌ ${data.error}`,
            });
        }

        res.status(200).json({
            message: "📥 تم استخراج بيانات الفيديو بنجاح",
            results: data,
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
    name: "TikTok-dl",
    type: "download",
    url: `${global.t}/api/download/tik?url=رابط_TikTok_هنا`,
    logo: "https://files.catbox.moe/75scb9.jpg",
    router,
};