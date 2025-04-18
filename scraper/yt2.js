const axios = require('axios');

const formats = ["audio", "video"];
const audioQuality = [320, 256, 192, 128, 64];
const videoQuality = ["360p", "480p", "720p", "1080p"];

const ytdl = async (url) => {
  const getToken = async (url) => {
    const extractVideoId = (url) => {
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const id = extractVideoId(url);
    if (!id) {
      throw new Error('ID videonya gk ketemu jir, pastikan link youtube yak');
    }

    const config = {
      method: 'GET',
      url: `https://dd-n01.yt2api.com/api/v4/info/${id}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'Accept': 'application/json',
        'accept-language': 'id-ID',
        'referer': 'https://bigconv.com/',
        'origin': 'https://bigconv.com',
        'alt-used': 'dd-n01.yt2api.com',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'priority': 'u=0',
        'te': 'trailers'
      }
    };

    try {
      const response = await axios.request(config);
      console.log('GetToken Response Data:', response.data);
      console.log('GetToken Response Headers:', response.headers);
      
      const cookies = response.headers['set-cookie'];
      const processedCookie = cookies ? cookies[0].split(';')[0] : '';
      const authorization = response.headers['authorization'] || '';
      return { data: response.data, cookie: processedCookie, authorization };
    } catch (error) {
      console.error('GetToken Error:', error.response?.status, error.response?.data);
      throw new Error('Error in getToken: ' + error.message);
    }
  };

  const convert = async (url, format, quality = "720p") => {
    const data = await getToken(url);
    const formats = data.data.formats;

    let token;
    if (format === "audio") {
      const audioOptions = formats.audio.mp3;
      const selectedAudio = audioOptions.find(option => option.quality === quality);
      if (selectedAudio) {
        token = selectedAudio.token;
      } else {
        throw new Error(`Kualitas audio ${quality} tidak tersedia.`);
      }
    } else if (format === "video") {
      const videoOptions = formats.video.mp4;
      const selectedVideo = videoOptions.find(option => option.quality === quality);
      if (selectedVideo) {
        token = selectedVideo.token;
      } else {
        throw new Error(`Kualitas video ${quality} tidak tersedia.`);
      }
    } else {
      throw new Error('Format tidak dikenali. Gunakan "audio" atau "video".');
    }

    const raw = JSON.stringify({ "token": token });

    const config = {
      method: 'POST',
      url: 'https://dd-n01.yt2api.com/api/v4/convert',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'accept-language': 'id-ID',
        'referer': 'https://bigconv.com/',
        'origin': 'https://bigconv.com',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'priority': 'u=0',
        'te': 'trailers',
        'Cookie': data.cookie,
        'authorization': data.authorization
      },
      data: raw
    };

    try {
      const response = await axios.request(config);
      console.log('Convert Response Data:', response.data);
      console.log('Convert Response Headers:', response.headers);
      return { jobId: response.data.id, cookie: data.cookie, authorization: data.authorization };
    } catch (error) {
      console.error('Convert Error:', error.response?.status, error.response?.data);
      throw new Error('Error in convert: ' + error.message);
    }
  };

  const download = async (url, format, quality = "720p") => {
    const { jobId, cookie, authorization } = await convert(url, format, quality);
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        const config = {
          method: 'GET',
          url: `https://dd-n01.yt2api.com/api/v4/status/${jobId}`,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
            'Accept': 'application/json',
            'accept-language': 'id-ID',
            'referer': 'https://bigconv.com/',
            'origin': 'https://bigconv.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'priority': 'u=4',
            'te': 'trailers',
            'Cookie': cookie,
            'authorization': authorization
          }
        };

        try {
          const response = await axios.request(config);
          console.log('Download Status Response Data:', response.data);
          console.log('Download Status Response Headers:', response.headers);
          if (response.data.status === 'completed') {
            clearInterval(interval);
            resolve(response.data);
          } else if (response.data.status === 'failed') {
            clearInterval(interval);
            resolve(response.data);
          }
        } catch (error) {
          console.error('Download Status Error:', error.response?.status, error.response?.data);
          clearInterval(interval);
          reject(error);
        }
      };

      const interval = setInterval(checkStatus, 5000);
    });
  };

  try {
    const result = await download(url, "video", "720p");
    return {
      author: "Herza",
      status: 200,
      data: result
    };
  } catch (error) {
    return {
      author: "Herza",
      status: 500,
      data: { error: error.message }
    };
  }
};

module.exports = { ytdl };
