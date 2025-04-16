const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/imagin", async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt parameter is required" });
  }

  try {
    const response = await axios({
      url: "https://s9.piclumen.art/comfy/api/generate-image",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Response-Type": "image/jpeg",
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; NX769J Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.107 Mobile Safari/537.36",
      },
      data: { prompt },
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", "image/jpeg");
    res.send(response.data);
  } catch (e) {
    res.status(500).json({ error: `An error occurred: ${e.message}` });
  }
});

module.exports = {
  path: "/api/ai",
  name: "IMAGIN-v1",
  type: "image-generation",
  url: `${global.t}/api/ai/imagin?prompt=girl and cats`,
  logo: "https://files.catbox.moe/ogljid.png",
  router,
};