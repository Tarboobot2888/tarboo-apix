const express = require('express');
const axios = require('axios');

const router = express.Router();
const encodeKey = "c2stY3dheXdxbHlndG5hZm5oc2dmbmRpY3NxcnlhcmJjb2pzdmdmampzc3F0bWpzZHdl";

const decodeKey = (encodedKey) => Buffer.from(encodedKey, "base64").toString("utf-8");

router.get('/sili', async (req, res) => {
    const { prompt, model = "internlm/internlm2_5-7b-chat", system } = req.query;

    if (!prompt) {
        return res.status(400).json({ error: "❌ Parameter 'prompt' مطلوب!" });
    }

    const url = "https://api.siliconflow.cn/v1/chat/completions";
    const messages = [
        { role: "user", content: prompt },
        ...(system ? [{ role: "system", content: system }] : [])
    ];

    const requestData = { model, messages };

    try {
        const { data } = await axios.post(url, requestData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${decodeKey(encodeKey)}`
            }
        });

        res.status(200).json({ result: data });
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

module.exports = {
  path: "/api/ai",
  name: "sili-Ai",
  type: "ai",
  url: `${global.t}/api/ai/sili?prompt=hi`,
  logo: "https://f.top4top.io/p_3351wuy480.jpg",
  router,
};
