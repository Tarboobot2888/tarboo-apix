const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

router.get("/gemini", async (req, res) => {
  const prompt = req.query.prompt;
  
  if (!prompt) {
    return res.status(400).json({
      status: 400,
      message: "يرجى إدخال prompt!",
    });
  }

  try {
    const response = await requestAuth(prompt);

    // استبدال جميع \n بـ <br> لتجنب مشاكل العرض
    const formattedResponse = response.replace(/\n/g, " ");

    res.status(200).json({ response: formattedResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "حدث خطأ أثناء الاتصال بالشات بوت.",
    });
  }
});

module.exports = {
  path: "/api/ai",
  name: "Gemini-Ai",
  type: "ai",
  url: `${global.t}/api/ai/gemini?prompt=كيف%20حالك؟`,
  logo: "https://i.ibb.co/TqcWGvh3/uploaded-image.jpg",
  router,
};

async function requestAuth(prompt) {
  const url = "https://ai.jaze.top/api/auth/gemini";
  const headers = {
    accept: "*/*",
    "accept-language": "id-ID,id;q=0.9",
    "content-type": "multipart/form-data",
    cookie: "i18n_redirected=zh",
    origin: "https://ai.jaze.top",
    priority: "u=1, i",
    referer: "https://ai.jaze.top/?session=1",
    "sec-ch-ua": `"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge Simulate";v="131", "Lemur";v="131"`,
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": `"Android"`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  };

  try {
    const form = new FormData();
    form.append("model", "gemini-1.5-flash");
    form.append(
      "messages",
      JSON.stringify([
        {
          role: "system",
          content:
            "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
        },
        { role: "user", content: prompt },
      ])
    );

    const response = await axios.post(url, form, { headers });
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}
