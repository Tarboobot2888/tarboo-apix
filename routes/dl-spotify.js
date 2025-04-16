const express = require('express');

const axios = require('axios');

const router = express.Router();

async function spotidown(url) {

    try {

        console.log(`🔍 Fetching data from: ${url}`);

        const response = await axios.post(

            'https://spotymate.com/api/download-track',

            { url: url },

            {

                headers: {

                    'Content-Type': 'application/json',

                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',

                    'Referer': 'https://spotymate.com/'

                }

            }

        );

        if (response.data && response.data.file_url) {

            return {

                status: true,

                file_url: response.data.file_url

            };

        } else {

            return {

                status: false,

                message: '❌ Tidak dapat menemukan link unduhan!'

            };

        }

    } catch (error) {

        return {

            status: false,

            message: `❌ Error: ${error.message}`

        };

    }

}

router.get('/spotify', async (req, res) => {

    const { url } = req.query;

    if (!url) {

        return res.status(400).json({ status: false, message: '❌ يرجى إدخال رابط Spotify!' });

    }

    const result = await spotidown(url);

    if (result.status) {

        res.json({ status: true, file_url: result.file_url });

    } else {

        res.status(404).json({ status: false, message: result.message });

    }

});

module.exports = {

    path: '/api/download',

    name: 'SPOTIFY_DOWNLOADER',

    type: 'download',

    url: `${global.t}/api/tools/spotify?url=https://open.spotify.com/track/3kSuigMCaMtyHXcMs1vbg8`,

    logo: 'https://files.catbox.moe/0g12gb.jpg',

    router,

};