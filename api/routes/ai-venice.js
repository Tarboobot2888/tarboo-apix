const express = require("express");
const axios = require("axios");

const router = express.Router();

const venice = {
    chatbot: async (question, model) => {
        const data = JSON.stringify({
            "requestId": "scrape-for-all",
            "modelId": model,
            "prompt": [{ "content": question, "role": "user" }],
            "systemPrompt": "",
            "conversationType": "text",
            "temperature": 0.8,
            "webEnabled": true,
            "topP": 0.9,
            "isCharacter": false,
            "clientProcessingTime": 2834
        });

        const config = {
            method: "POST",
            url: "https://venice.ai/api/inference/chat",
            headers: {
                "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
                "Content-Type": "application/json",
                "accept-language": "id-ID",
                "referer": "https://venice.ai/chat",
                "x-venice-version": "20241221.032412",
                "origin": "https://venice.ai",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "priority": "u=4",
                "te": "trailers"
            },
            data: data
        };

        try {
            const res = await axios.request(config);
            const chunks = res.data.split("\n").filter(chunk => chunk).map(chunk => JSON.parse(chunk));
            const answer = chunks.map(chunk => chunk.content).join("");
            return answer;
        } catch (error) {
            console.error("❌ خطأ أثناء تنفيذ الدردشة:", error.response?.data || error.message);
            throw new Error("❌ حدث خطأ أثناء تنفيذ الدردشة.");
        }
    }
};

router.get("/venice", async (req, res) => {
    try {
        const { question, model } = req.query;

        if (!question || !model) {
            return res.status(400).json({ error: "❌ يرجى تقديم السؤال والموديل باستخدام ?question= & ?model=" });
        }

        const answer = await venice.chatbot(question, model);

        res.status(200).json({
            message: "✅ تم تنفيذ الدردشة بنجاح",
            answer: answer
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    path: '/api/ai',
    name: 'VENICE',
    type: 'ai',
    url: `${global.t}/api/ai/venice?question=hello&model=llama-3.3-70b`,
    logo: 'https://i.ibb.co/4ZRK9JDJ/uploaded-image.jpg',
    router,
};
