const express = require("express");

const router = express.Router();

router.get("/ssweb", async (req, res) => {

  const { url } = req.query;

  if (!url) {

    return res.status(400).json({ error: "URL parameter is required" });

  }

  // رابط خدمة s-shot.ru لأخذ لقطة الشاشة

  const screenshotUrl = `https://mini.s-shot.ru/2560x1600/PNG/2560/Z100/?${encodeURIComponent(url)}`;

  res.json({ screenshotUrl });

});

module.exports = {

    path: '/api/tools',

    name: 'SSWEB',

    type: 'tools',

    url: `${global.t}/api/tools/ssweb?url=https://takamura-api.joanimi-world.site`,

    logo: 'https://l.top4top.io/p_3353capxa0.jpg',

    router,

};