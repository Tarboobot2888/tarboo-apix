const express = require('express');
const fs = require('fs').promises;
const { blackbox } = require("gpti");

const router = express.Router();

router.get('/blackbox', async (req, res) => {
    try {
        const { ask, id } = req.query;
        if (!ask || !id) {
            return res.status(400).json({ status: false, message: 'Both "ask" and "id" parameters are required.' });
        }

        const filePath = `./tmp/${id}.json`;
        let messages = [];

        try {
            const data = await fs.readFile(filePath, 'utf8');
            messages = JSON.parse(data);
        } catch {
            messages = [{ role: "system", content: "You're a helpful assistant." }];
        }

        messages.push({ role: "user", content: ask });

        const response = await blackbox({
            messages,
            markdown: false,
            stream: false
        });

        res.json({ status: true, response });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

module.exports = {
    path: '/api/ai',
    name: 'BLACKBOX',
    type: 'ai',
    url: `${global.t}/api/ai/blackbox?ask=hello&id=1`,
    logo: 'https://i.ibb.co/whXjfvg4/uploaded-image.jpg',
    router,
};
