const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function ytVideo(url) {
  try {
    let { data } = await axios.get(`https://10downloader.com/download?v=${encodeURIComponent(url)}&lang=en&type=video`);
    let $ = cheerio.load(data);

    const videoDetails = {
      title: $(".info .title").text().trim(),
      thumbnail: $(".info img").attr("src"),
      duration: $(".info .duration").text().replace("Duration:", "").trim(),
      download: null
    };

    $("#video-downloads .downloadsTable tbody tr").each((i, el) => {
      const quality = $(el).find("td:nth-child(1)").text().trim();
      const format = $(el).find("td:nth-child(2)").text().trim();
      const size = $(el).find("td:nth-child(3)").text().trim();
      const link = $(el).find("td:nth-child(4) a").attr("href");

      if (quality.includes("360p") && link) {
        videoDetails.download = { quality, format, size, link };
        return false; // إيقاف البحث بعد العثور على الجودة المطلوبة
      }
    });

    return videoDetails;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

router.get("/yt-mp4", async (req, res) => {
  let url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "يرجى إضافة رابط يوتيوب في البرامتر 'url'" });
  }

  let video = await ytVideo(url);
  if (!video || !video.download) {
    return res.status(404).json({ error: "❌ لم يتم العثور على رابط تحميل بجودة 360p." });
  }

  res.json({
    title: video.title,
    duration: video.duration,
    thumbnail: video.thumbnail,
    download: video.download
  });
});

module.exports = {
  path: "/api/download",
  name: "yt-mp4",
  type: "download",
  url: `${global.t}/api/download/yt-mp4?url=https://youtu.be/lnjJI77ln9c?si=nJ1PRARzZgIIFkpd`,
  logo: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png",
  router
};
