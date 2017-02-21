import AWS from 'aws-sdk';
import fs from 'fs';
import im from 'imagemagick';

AWS.config.region = 'ap-northeast-2';

const s3 = new AWS.S3();
const BUCKET_NAME = 'milkteam';

/*
  params: {
    Bucket,
    Key,
    ACL,
    Body
  }
*/
const uploadImg = (Key, userFilePath, callback) => {
  console.log('Key', Key);
  console.log('userFilePath', userFilePath);

  im.identify(userFilePath, (err, features) => {
    if (err) {
      callback(err);
    } else if (features.format !== 'JPEG' || features.format !== 'PNG') {
      callback(err); // 포맷 에러
    }
    const resizeOption = {
      srcPath: userFilePath,
      dstPath: 'result-' + userFilePath,
      width: 100,
      progressive: true
    };
    // imagemagick으로 파일 압축
    im.resize(resizeOption, (err, stdout, stderr) => {
      if (err) {
        callback(err);
      }
      console.log(features.format);
      console.log(features['mime type']);
      const params = {
        Bucket: BUCKET_NAME,
        Key,
        ACL: 'public-read',
        Body: fs.createReadStream(userFilePath),
        ContentType: features['mime type']
      };
      s3.upload(params, (err, data) => {
        if (err) {
          return callback(err);
        } else {
          console.log(data);
          return callback(null, data);
        }
      });
    });
  })
}

const downloadImg = ({key}) => {
  const file = fs.createWriteStream(key);
  s3.getObject({Bucket: BUCKET_NAME, Key: key}).createReadStream().pipe(file);
}

module.exports = {
  uploadImg,
  downloadImg
};
