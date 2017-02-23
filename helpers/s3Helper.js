import AWS from 'aws-sdk';
import fs from 'fs';
import im from 'imagemagick';
import path from 'path';

AWS.config.region = 'ap-northeast-2';

const s3 = new AWS.S3();
const BUCKET_NAME = 'legendtv';

/*
  params: {
    Bucket,
    Key,
    ACL,
    Body
  }
*/
const uploadImg = (userId, Key, userFilePath, callback) => {
  im.identify(userFilePath, (err, features) => {
    if (err || (features.format !== 'JPEG' && features.format !== 'PNG')) {
      return callback(err);
    }

    const resizeOption = {
      srcPath: userFilePath,
      width: 100,
      progressive: true
    };

    im.resize(resizeOption, (err, stdout, stderr) => {
      if (err) {
        return callback(err);
      }
      const newKey = Date.now() + "-" + Key;
      const params = {
        Bucket: BUCKET_NAME,
        Key:  newKey,
        ACL: 'public-read',
        Body: new Buffer(stdout, 'binary'),
        ContentType: features['mime type']
      };
      s3.upload(params, (err, data) => {
        if (err) {
          return callback(err);
        }
        data.newKey = newKey;

        callback(null, data);
      });
    });
  })
}

const checkAndRemoveImg = (Key, callback) => {
  if (!Key) {
    return callback(null);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      return callback(err);
    }

    callback(null, data);
  });
}

module.exports = {
  uploadImg,
  checkAndRemoveImg
};
