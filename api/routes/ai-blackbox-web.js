const express = require("express");
const axios = require("axios");

const router = express.Router();
const API_URL = "https://www.blackbox.ai/api/chat";

router.get("/blackbox-search", async (req, res) => {
try {
const { prompt } = req.query;

if (!prompt) {  
  return res.status(400).json({ error: "Missing 'prompt' parameter!" });  
}  

const headers = {  
  "authority": "www.blackbox.ai",  
  "accept": "*/*",  
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",  
  "content-type": "application/json",  
  "origin": "https://www.blackbox.ai",  
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"  
};  

const data = {  
  "messages": [{ "role": "user", "content": prompt, "id": "54lcaEJ" }],  
  "agentMode": {},  
  "id": "RDyqb0u",  
  "previewToken": null,  
  "userId": null,  
  "codeModelMode": true,  
  "trendingAgentMode": {},  
  "isMicMode": false,  
  "userSystemPrompt": null,  
  "maxTokens": 1024,  
  "playgroundTopP": null,  
  "playgroundTemperature": null,  
  "isChromeExt": false,  
  "githubToken": "",  
  "clickedAnswer2": false,  
  "clickedAnswer3": false,  
  "clickedForceWebSearch": false,  
  "visitFromDelta": false,  
  "isMemoryEnabled": false,  
  "mobileClient": false,  
  "userSelectedModel": null,  
  "validated": "00f37b34-a166-4efb-bce5-1312d87f2f94",  
  "imageGenerationMode": false,  
  "webSearchModePrompt": true,  
  "deepSearchMode": false,  
  "domains": null,  
  "vscodeClient": false,  
  "codeInterpreterMode": false,  
  "customProfile": {  
    "name": "",  
    "occupation": "",  
    "traits": [],  
    "additionalInfo": "",  
    "enableNewChats": false  
  },  
  "session": null,  
  "isPremium": false,  
  "subscriptionCache": null,  
  "beastMode": false  
};  

const response = await axios.post(API_URL, data, { headers, timeout: 60000 });  

    const cleanedResponse = response.data.split('$~~~$')[1]; // استخراج النص بعد الفاصل
    const result = JSON.parse(cleanedResponse);  // محاولة تحليل النص كـ JSON

    // تنسيق البيانات المعادة
    const formattedResults = result.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      position: item.position,
      currency: item.currency || 'N/A',
      price: item.price || 'N/A',
      sitelinks: item.sitelinks ? item.sitelinks.map(sitelink => ({
        title: sitelink.title,
        link: sitelink.link
      })) : []
    }));

    res.json({ response: formattedResults });

  } catch (error) {
    res.status(500).json({
      error: "Failed to process request",
      details: error.code === "ECONNABORTED" ? "Request timeout" : error.message
    });
  }
});

module.exports = {
    path: '/api/ai',
    name: 'BLACKBOX-webs',
    type: 'ai',
    url: `${global.t}/api/ai/blackbox-search?prompt=hello`,
    logo: 'https://l.top4top.io/p_3352uajiz0.jpg',
    router,
};
