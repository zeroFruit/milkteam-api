import '../config/env/env';
import request from 'request';

const getThumbnailFromId = (videoId) => {
  const URL = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.GOOGLE_API_KEY}&part=snippet`;
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

module.exports = {
  getThumbnailFromId
}
