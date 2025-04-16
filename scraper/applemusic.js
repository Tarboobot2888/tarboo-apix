const axios = require("axios");
const cheerio = require("cheerio");

class AppleMusicDownload {
    download = async function download(url) {
        return new Promise(async (resolve, reject) => {
            axios.get(url).then(async (a) => {
                let $ = cheerio.load(a.data);
                let json = JSON.parse($("script").eq(0).text());
                let info = {
                    metadata: {},
                    download: {},
                };
                delete json.audio["@type"];
                delete json.audio.audio;
                delete json.audio.inAlbum["@type"];
                delete json.audio.inAlbum.byArtist;
                json.audio.artist = json.audio.byArtist[0];
                delete json.audio.artist["@type"];
                delete json.audio.byArtist;
                info.metadata = json.audio;
                let { data } = await axios
                    .get(
                        "https://aaplmusicdownloader.com/api/composer/ytsearch/mytsearch.php",
                        {
                            params: {
                                name: info.metadata.name,
                                artist: info.metadata.artist.name,
                                album: info.metadata.inAlbum.name,
                                link: info.metadata.url,
                            },
                        }
                    )
                    .catch((e) => e.response);
                if (!data.videoid) return reject(data);
                let download = await axios
                    .get("https://aaplmusicdownloader.com/api/ytdl.php?q=" + data.videoid)
                    .catch((e) => e.response);
                info.download = download.data.dlink;
                resolve(info);
            });
        });
    };
}

module.exports = new AppleMusicDownload();
