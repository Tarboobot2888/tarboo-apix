const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");

const router = express.Router();

async function fdown(url) {
    try {
        let formData = new FormData();
        formData.append("URLz", url);

        let headers = {
            headers: {
                ...formData.getHeaders(),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Host": "fdown.net",
                "Origin": "https://fdown.net",
                "Pragma": "no-cache",
                "Referer": "https://fdown.net/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        };

        let { data: html } = await axios.post("https://fdown.net/download.php", formData, headers);
        let $ = cheerio.load(html);

        let result = {
            title: $(".lib-header").text().trim() || "No title",
            caption: $(".lib-desc").first().text().replace("Description:", "").trim() || "No description",
            duration: $(".lib-desc").eq(1).text().replace("Duration:", "").trim() || "No duration",
            image: $(".lib-img-show").attr("src") || "No image",
            sdLink: $("#sdlink").attr("href") || "No SD link",
            hdLink: $("#hdlink").attr("href") || "No HD link"
        };

        return result;
    } catch (error) {
        console.error("Error fetching video data:", error);
        return { error: "Failed to fetch video data." };
    }
}

router.get("/fb", async (req, res) => {
    let url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    let media = await fdown(url);
    res.json(media);
});

module.exports = {
    path: '/api/download',
    name: 'FACEBOOK',
    type: 'download',
    url: `${global.t}/api/download/fb?url=https://www.facebook.com/share/v/1FB3eDADbU/`,
    logo: 'https://c.top4top.io/p_3352ukty40.jpg',
    router
};
