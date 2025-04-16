const express = require("express");
const axios = require("axios");
const router = express.Router();

const parseResponse = (response) => {
  const lines = response.split("\n");
  const line = lines.find((line) => line.startsWith("1:"));
  if (line) {
    const jsonString = line.slice(2).trim();
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return null;
    }
  }
  return null;
};

class Heurist {
  constructor() {
    this.url = "https://imagine.heurist.ai/models/";
    this.headers = {
      accept: "text/x-component",
      "accept-language": "id-ID,id;q=0.9",
      "content-type": "text/plain;charset=UTF-8",
      "next-action": "a6fbbd1f3d3be1c0f57d10c2fd445817aad75870",
      "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22models%22%2C%7B%22children%22%3A%5B%5B%22slug%22%2C%22BrainDance%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fmodels%2FBrainDance%22%2C%22refresh%22%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
      priority: "u=1, i",
      "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge Simulate";v="131", "Lemur";v="131"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      cookie: "_ga=GA1.1.1762423261.1735607627; _ga_B94HB7EM0Q=GS1.1.1735607626.1.1.1735607645.0.0.0",
      Referer: "https://imagine.heurist.ai/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };
  }

  async generateImage({
    prompt,
    neg_prompt = "(worst quality: 1.4), bad quality, nsfw",
    num_iterations = 25,
    guidance_scale = 5,
    width = 512,
    height = 768,
    seed = -1,
    model = "BrainDance"
  }) {
    const payload = [{
      prompt,
      neg_prompt,
      num_iterations,
      guidance_scale,
      width,
      height,
      seed,
      model
    }];

    try {
      const response = await axios.post(
        `${this.url}${model}`,
        payload,
        { headers: this.headers }
      );
      
      return {
        parsed: parseResponse(response.data),
        raw: response.data
      };
    } catch (error) {
      throw new Error(`API Error: ${error.response?.data || error.message}`);
    }
  }
}

// Route Handler
router.get("/heurist", async (req, res) => {
  const heurist = new Heurist();
  const { query } = req;

  // تحقق من المدخلات الأساسية
  if (!query.prompt) {
    return res.status(400).json({
      error: "المعلمة prompt مطلوبة",
      example: "/heurist?prompt=وصف_الصورة&width=512"
    });
  }

  try {
    const params = {
      prompt: query.prompt,
      neg_prompt: query.neg_prompt,
      num_iterations: Number(query.num_iterations) || 25,
      guidance_scale: Number(query.guidance_scale) || 5,
      width: Number(query.width) || 512,
      height: Number(query.height) || 768,
      seed: Number(query.seed) || -1,
      model: query.model || "BrainDance"
    };

    const result = await heurist.generateImage(params);
    
    if (!result.parsed) {
      throw new Error("فشل في تحليل الاستجابة من الخادم");
    }

    res.status(200).json({
      success: true,
      data: result.parsed,
      meta: {
        model: params.model,
        dimensions: `${params.width}x${params.height}`
      }
    });

  } catch (error) {
    console.error("[ERROR]", error);
    res.status(500).json({
      success: false,
      error: error.message,
      tip: "تأكد من صحة المعطيات المدخلة والمفاتيح المطلوبة"
    });
  }
});

module.exports = {
  path: "/api/ai",
  name: "HEURIST-IMAGE-AI",
  type: "image-generation",
  url: `${global.t}/api/ai/heurist?prompt=black-cat`,
  logo: "https://i.ibb.co/9mpwVvrv/uploaded-image.jpg",
  router
};
