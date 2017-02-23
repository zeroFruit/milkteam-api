import '../config/env/env';
import request from 'request';

const getThumbnailFromId = (videoId) => {
  if (!videoId) {
    return Promise.reject();
  }

  const URL = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.GOOGLE_API_KEY}&part=snippet&fields=items/snippet/thumbnails/default/url`;
  return new Promise((resolve, reject) => {
    request(URL, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let json = JSON.parse(body);

        resolve(json.items[0].snippet.thumbnails.default.url);
      } else {
        reject(error);
      }
    });
  });
}

const getYTDuration = (videoId) => {
  let retDuration = "";

  if (!videoId) {
    return Promise.reject();
  }

  const URL = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.GOOGLE_API_KEY}&part=contentDetails&fields=items/contentDetails/duration`
  return new Promise((resolve, reject) => {
    request(URL, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let json = JSON.parse(body);

        let duration = json.items[0].contentDetails.duration;
        let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

        let hours = (parseInt(match[1]) || 0);
        let minutes = (parseInt(match[2]) || 0);
        let seconds = (parseInt(match[3]) || 0);

        if (hours !== 0)    { retDuration  += `${hours}h` }
        if (minutes !== 0)  { retDuration  += ` ${minutes}m` }
        if (seconds !== 0)  { retDuration  += ` ${seconds}s` }

        resolve(retDuration);
      }
    })
  }).catch((e) => reject(e));
}


module.exports = {
  getThumbnailFromId,
  getYTDuration
}
