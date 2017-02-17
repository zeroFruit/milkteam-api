import Code from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import {SubChatRoom} from '../models/subChat';

async function getLeftChats (req, res) {
  let videoId = req.params.id;

  try {
    let chats = await SubChatRoom.getLeftChat(videoId);

    res.json({code: Code.GET_CHATS_SUCCESS, data: chats});
  } catch (e) {
    responseByCode(res, Code.GET_CHATS_FAIL, 400);
  }
}

async function getRightChats (req, res) {
  let videoId = req.params.id;

  try {
    let chats = await SubChatRoom.getRightChat(videoId);

    res.json({code: Code.GET_CHATS_SUCCESS, data: chats});
  } catch (e) {
    responseByCode(res, Code.GET_CHATS_FAIL, 400);
  }
}

module.exports = {
  getLeftChats,
  getRightChats
}
