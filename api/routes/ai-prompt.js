const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/cai", async (req, res) => {
  const prompt = req.query.prompt;
  const text = req.query.text;  // إضافة متغير text من المدخلات
  if (!prompt || !text) {  // التحقق من وجود both prompt و text
    return res.status(400).json({
      status: 400,
      message: "Masukkan Prompt dan Text!"  // الرسالة عند عدم وجود prompt أو text
    });
  }

  try {
    const response = await chat(prompt, text);  // تمرير text إلى الدالة
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan dalam memproses permintaan."
    });
  }
});

module.exports = {
    path: '/api/ai',
    name: 'AI-CHARACTER',
    type: 'ai',
    url: `${global.t}/api/ai/cai?prompt=ur%character%prompt%by%english%and%datels&text=مرحبا`,
    logo: 'https://i.ibb.co/bjSWtGGS/uploaded-image.jpg',
    router,
};

async function chat(prompt, text) {  // إضافة text كـ parameter
  const response = await axios({
    method: "POST",
    url: "https://chateverywhere.app/api/chat",
    headers: {
      "Content-Type": "application/json",
      "Cookie": "_ga=GA1.1.34196701.1707462626; _ga_ZYMW9SZKVK=GS1.1.1707462625.1.0.1707462625.60.0.0; ph_phc_9n85Ky3ZOEwVZlg68f8bI3jnOJkaV8oVGGJcoKfXyn1_posthog=%7B%22distinct_id%22%3A%225aa4878d-a9b6-40fb-8345-3d686d655483%22%2C%22%24sesid%22%3A%5B1707462733662%2C%22018d8cb4-0217-79f9-99ac-b77f18f82ac8%22%2C1707462623766%5D%7D",
      "Origin": "https://chateverywhere.app",
      "Referer": "https://chateverywhere.app/id",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    },
    data: {
      model: {
        id: "gpt-3.5-turbo-0613",
        name: "GPT-3.5",
        maxLength: 12000,
        tokenLimit: 4000,
      },
      prompt: prompt,
      messages: [
        {
          pluginId: null,
          content: text,  // استخدام text هنا
          role: "user"
        }
      ]
    }
  });

  return response.data;
}
