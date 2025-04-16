const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");

const router = express.Router();

// وظائف Deepai
const DeepaiFunctions = {
  // دالة لتوليد الهاش
  hashStr: (inputString) => {
    const md5Hash = crypto.createHash('md5').update(inputString, 'utf-8').digest('hex');
    return md5Hash.split('').reverse().join('');
  },

  // دالة لتوليد API Key
  createKey: async () => {
    const randomStr = String(Math.floor(Math.random() * 100000000000));
    let userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/${Math.floor(Math.random() * 700) + 500}.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20) + 60}.0.3163.100 Safari/${Math.floor(Math.random() * 20) + 60}.36`;

    const randomStr1 = DeepaiFunctions.hashStr(userAgent + randomStr + 'suditya_is_a_smelly_hacker');
    const randomStr2 = DeepaiFunctions.hashStr(userAgent + randomStr1);
    const randomStr3 = DeepaiFunctions.hashStr(userAgent + randomStr2);

    const apiKey = `tryit-${randomStr}-${randomStr3}`;

    return { apiKey, userAgent };
  },

  // دالة المحادثة مع API
  chat: async (prompt) => {
    let data = new FormData();
    data.append('chat_style', 'chat');
    data.append('chatHistory', `[{"role":"user","content": "${prompt}"}]`);
    data.append('model', 'standar');

    const { apiKey, userAgent } = await DeepaiFunctions.createKey();

    const headers = {
      'User-Agent': userAgent,
      'api-key': apiKey,
    };

    try {
      const response = await axios.post('https://api.deepai.org/hacking_is_a_serious_crime', data, { headers });
      return response.data;
    } catch (error) {
      throw new Error('فشل في الطلب: ' + (error.response?.data || error.message));
    }
  }
};

// مسار API لجلب استجابة المحادثة من Deepai
router.get("/openai", async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: "❌ يجب إدخال نص في البرامتر 'prompt'." });
  }

  try {
    const response = await DeepaiFunctions.chat(prompt);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء المعالجة.", details: error.message });
  }
});

module.exports = {
  path: "/api/ai",
  name: "openai",
  type: "ai",
  url: `${global.t}/api/ai/openai?prompt=hello`,
  logo: "https://g.top4top.io/p_33526sdm70.jpg",
  router
};
