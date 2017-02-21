import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import {uploadImg, downloadImg} from '../helpers/s3Helper';
import _                from 'lodash';
import fs               from 'fs';
import formidable       from 'formidable';
import {User}           from '../models/user';

const FILE_FORM_NAME = 'userfile';

async function uploadProfileImg (req, res) {
  const form = new formidable.IncomingForm();

  try {
    form.parse(req, (err, fields, files) => {
      uploadImg(files[FILE_FORM_NAME].name, files[FILE_FORM_NAME].path, (err, data) => {
        if (err) throw err;

        res.json({data: 'success'});
      });
    })
  } catch (e) {
    console.log(e);
    responseByCode(res, Code.POST_USER_FAIL, 400);
  }

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
  uploadProfileImg,
  addUser,
  loginUser,
  logoutUser,
  getUser
}
