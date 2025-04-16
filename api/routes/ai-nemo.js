const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const API_URL = "https://mind.hydrooo.web.id/v1/chat";

router.get("/nemo", async (req, res) => {
  try {
    const { question } = req.query;

    if (!question) {
      return res.status(400).json({ error: "Missing 'question' parameter!" });
    }

    const form = new FormData();
    form.append("content", `User: ${question}`);
    form.append("model", "@mistral/open-mistral-nemo");

    const { data } = await axios.post(API_URL, form, {
      headers: { ...form.getHeaders() },
      timeout: 60000 // مهلة 60 ثانية
    });

    // إزالة جميع الأسطر الجديدة \n من الرد
    const cleanedResponse = data.result.replace(/\n/g, " ");

    res.json({ response: cleanedResponse });
  } catch (error) {
    res.status(500).json({
      error: "Failed to process request",
      details: error.code === "ECONNABORTED" ? "Request timeout" : error.message
    });
  }
});

module.exports = {
  path: '/api/ai',
  name: 'nemo-ai',
  type: 'ai',
  url: `${global.t}/api/ai/nemo?question=xo`,
  logo: 'https://e.top4top.io/p_3352vjzer0.jpg',
  router
};
