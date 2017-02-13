import {User} from '../models/user';

const responseByCode = (res, code, status = 200) => {
  res.status(status).json({code});
}

const socketAuth = (token) => {
    User.findByToken(token).then((user) => {
      if (!user) {
        return undefined;
      } else {
        return user;
      }
    }).catch((e) => undefined);
}

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
  socketAuth,
  YouTubeGetID
}
