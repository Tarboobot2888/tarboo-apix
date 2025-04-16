const express = require("express");

const axios = require("axios");

const router = express.Router();

const validModels = ["openai", "llama", "mistral", "mistral-large"];

router.get("/sandboximg", async (req, res) => {

  const { action = "chatbot", model, prompt } = req.query;

  const selectedModel = model || "openai";

  if (action === "chatbot") {

    if (!validModels.includes(selectedModel)) {

      return res.status(400).json({

        error: `Invalid model selected. Please choose one of: ${validModels.join(", ")}`

      });

    }

    const data = {

      messages: [prompt || "Hello!"],

      character: selectedModel

    };

    try {

      const response = await axios.post("https://chatsandbox.com/api/chat", data, {

        headers: {

          "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",

          "Content-Type": "application/json",

          "accept-language": "id-ID",

          referer: `https://chatsandbox.com/chat/${selectedModel}`,

          origin: "https://chatsandbox.com",

          "alt-used": "chatsandbox.com"

        }

      });

      return res.status(200).json({ result: response.data });

    } catch (error) {

      return res.status(500).json({ error: error.message });

    }

  } else if (action === "text2img") {

    const data = {

      messages: [prompt || "A default image prompt"],

      character: "ai-image-generator"

    };

    try {

      const response = await axios.post("https://chatsandbox.com/api/chat", data, {

        headers: {

          "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",

          "Content-Type": "application/json",

          "accept-language": "id-ID",

          referer: "https://chatsandbox.com/ai-image-generator",

          origin: "https://chatsandbox.com",

          "alt-used": "chatsandbox.com"

        }

      });

      const htmlString = response.data;

      const urlMatch = htmlString.match(/src="([^"]+)"/);

      return urlMatch

        ? res.status(200).json({ imageUrl: urlMatch[1] })

        : res.status(500).json({ error: "Could not extract image URL from response." });

    } catch (error) {

      return res.status(500).json({ error: error.message });

    }

  } else {

    return res.status(400).json({ error: "Invalid action. Use 'chatbot' or 'text2img'." });

  }

});

module.exports = {

    path: '/api/ai',

    name: 'SANDBOX',

    type: 'ai',

    url: `${global.t}/api/ai/sandboximg?prompt=cat`,

    logo: 'https://files.catbox.moe/z3igt5.jpg',

    router,

};