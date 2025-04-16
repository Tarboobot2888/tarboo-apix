const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");

const router = express.Router();

class BeautyScore {
  static async check(imageUrl) {
    if (!imageUrl) throw new Error("❌ الرجاء إرسال رابط صورة للتحليل.");

    try {
      // جلب الـ Token و الـ Cookies
      const getTokens = async () => {
        const response = await axios.get("https://www.beautyscoretest.com/");
        const $ = cheerio.load(response.data);
        return {
          token: $('input[name="_token"]').val(),
          cookies: response.headers["set-cookie"],
        };
      };

      const { token, cookies } = await getTokens();

      // تحميل الصورة من الرابط
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(imageResponse.data);

      // تجهيز البيانات للإرسال
      const form = new FormData();
      form.append("face", imageBuffer, "image.jpg");
      form.append("_token", token);

      // إرسال الصورة للتحليل
      const response = await axios.post("https://www.beautyscoretest.com/", form, {
        headers: {
          Origin: "https://www.beautyscoretest.com",
          Referer: "https://www.beautyscoretest.com/",
          "User-Agent": "Mozilla/5.0",
          Cookie: cookies.join("; "),
          ...form.getHeaders(),
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 303,
      });

      if (response.status === 302) {
        const redirect = response.headers.location;
        const redirectResponse = await axios.get(redirect, {
          headers: { Cookie: cookies.join("; ") },
        });
        response.data = redirectResponse.data;
      }

      // استخراج البيانات من الصفحة
      const $ = cheerio.load(response.data);
      const result = {
        score: $(".entry__date-day").text().trim(),
        gender: $(".entry__meta-slack").text().split(":")[1]?.trim(),
        age: $(".entry__meta-pin").text().split(":")[1]?.trim(),
        expression: $(".entry__meta-facebook").text().split(":")[1]?.trim(),
        faceShape: $(".entry__meta-comments").text().split(":")[1]?.trim(),
      };

      if (!result.score) throw new Error("❌ لم يتم تحديد الجمال.");

      return result;
    } catch (error) {
      console.error(error);
      throw new Error("❌ فشل التحليل، حاول مجدداً.");
    }
  }
}

// API Endpoint
router.get("/beauty-score", async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: "الرجاء إرسال رابط صورة للتحليل." });
  }

  try {
    const result = await BeautyScore.check(imageUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {

  path: "/api/tools",

  name: "Beauty-Score",

  type: "tools",

  url: `${global.t}/api/tools/beauty-score?imageUrl=https://files.catbox.moe/0brsi5.jpg`,

  logo: "https://files.catbox.moe/0brsi5.jpg",

  router,

};