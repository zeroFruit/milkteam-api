import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import {uploadImg, downloadImg} from '../helpers/s3Helper';
import _                from 'lodash';
import fs               from 'fs';
import formidable       from 'formidable';
import {User}           from '../models/user';

const FILE_FORM_NAME = 'userfile';

async function updateDisplayName (req, res) {
  try {
    await User.update({ _id: req.user._id }, { $set: { displayName: req.body.displayName } });

    res.json({code: Code.PUT_USER_SUCCESS, data: req.body.displayName});
  } catch (e) {
    responseByCode(res, Code.PUT_USER_FAIL, 400);
  }
}

async function displayNameDoubleCheck (req, res) {
  try {
    let user = await User.findOne({displayName: req.user.displayName});

    if (user) {
      res.json({code: Code.GET_USER_SUCCESS, data: 'fail'});
    }
    res.json({code: Code.GET_USER_SUCCESS, data: 'success'});
  } catch (e) {
    responseByCode(res, Code.GET_USER_FAIL, 400);
  }
}

async function uploadProfileImg (req, res) {
  const form = new formidable.IncomingForm();

  try {
    form.parse(req, (err, fields, files) => {
      const {name, path} = files[FILE_FORM_NAME];

      uploadImg(req.user._id, name, path, (err, data) => {
        if (err) {
          throw err;
        }

        // user 모델 업데이트
        const profile = { originalName: name, tag: data.Etag, link: data.Link };
        User.updateProfile(req.user._id, profile).then(() => {
          res.json({
            code: Code.POST_USER_SUCCESS,
            data: { tag: data.Etag, link: data.Link }
          });
        });
      });
    })
  } catch (e) {
    console.log(e);
    responseByCode(res, Code.S3_ERROR, 400);
  }
}

async function removeUser (req, res) {
  // 회원 탈퇴
}

async function addUser (req, res) {
  let body = _.pick(req.body, ['email', 'password', 'displayName']);
  let user = new User(body);

  try {
    await user.save();
    let token = await user.generateAuthToken();

    res.header('x-auth', token).json({code: Code.POST_USER_SUCCESS, data: user});
  } catch (e) {
    responseByCode(res, Code.POST_USER_FAIL, 400);
  }
}

async function loginUser (req, res) {
  let body = _.pick(req.body, ['email', 'password']);
  try {
    let user = await User.findByCredentials(body.email, body.password);
    let token = await user.generateAuthToken();

    res.header('x-auth', token).json({
      code: Code.POST_USER_LOGIN_SUCCESS,
      data: {email: user.email, displayName: user.displayName}
    });

  } catch (e) {
    responseByCode(res, Code.POST_USER_LOGIN_FAIL, 400);
  }
}

async function logoutUser (req, res) {
  try {
    await req.user.removeToken(req.token);

    responseByCode(res, Code.DELETE_USER_SUCCESS, 200);
  } catch (e) {
    responseByCode(res, Code.DELETE_USER_FAIL, 400);
  }
}

async function getUser (req, res) {
  try {
    res.json({
      code: Code.GET_USER_SUCCESS,
      data: {email: req.user.email, displayName: req.user.displayName}
    })
  } catch (e) {
    responseByCode(res, Code.GET_USER_FAIL, 400);
  }
}

module.exports = {
  updateDisplayName,
  displayNameDoubleCheck,
  uploadProfileImg,
  addUser,
  loginUser,
  logoutUser,
  getUser
}
