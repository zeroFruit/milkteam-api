import {User} from '../models/user';

const responseByCode = (res, code, status = 200) => {
  res.status(status).json({code});
}

const isRealString = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

const generateMessage = (from, text) => {
  return { from, text };
};

const YouTubeGetID = (url) => {
  let ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
    return ID;
};


module.exports = {
  responseByCode,
  isRealString,
  generateMessage,
  YouTubeGetID
}
