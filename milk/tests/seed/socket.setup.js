import {MainChatRoom} from '../../models/mainChat';
import {users}        from './setup';
import jwt            from 'jsonwebtoken';
import {redisClient}  from '../../config/redis';

const SOCKET_URL = 'http://ec2-52-78-175-43.ap-northeast-2.compute.amazonaws.com:3000';
const options = {
  path: '/api/socket/main'
};

const TEST_MAIN_CHAT_KEY = 'test_main';

const CHATTER_ONE_ID = 'ChatterIdOne';
const CHATTER_TWO_ID = 'ChatterIdTwo';
const CHATTER_THREE_ID = 'ChatterIdThree';
const CHATTER_FOUR_ID = 'ChatterIdFour';
const CHATTER_FIVE_ID = 'ChatterIdFive';
const CHATTER_SIX_ID = 'ChatterIdSix';

const roomOnechatters = [{
  id: CHATTER_ONE_ID,
  displayName: 'ChatterOne',
  anonymous: true
}, {
  id: CHATTER_TWO_ID,
  displayName: 'ChatterTwo',
  anonymous: true
}, {
  id: CHATTER_THREE_ID,
  displayName: 'ChatterThree',
  anonymous: true
}];

const roomTwoChatters = [{
  id: CHATTER_FOUR_ID,
  displayName: 'ChatterFour',
  anonymous: true
}, {
  id: CHATTER_FIVE_ID,
  displayName: 'ChatterFive',
  anonymous: true
}, {
  id: CHATTER_SIX_ID,
  displayName: 'ChatterSix',
  anonymous: true
}]

const mainChatRooms = [{
  videoId: 'videoIdOne',
  chatters: roomOnechatters
}, {
  videoID: 'videoIdTwo',
  chatters: roomTwoChatters
}];

const populateRoom = (done) => {
  MainChatRoom.remove({}).then(() => {
    MainChatRoom(mainChatRooms).save()
      .then(() => done())
      .catch((e) => done(e));
  });
};

const populateChatters = (done) => {
  redisClient.del(TEST_MAIN_CHAT_KEY, (err, reply) => {
    if (!err) {
      done();
    }
  });
};

module.exports = {
  SOCKET_URL,
  TEST_MAIN_CHAT_KEY,
  roomOnechatters,
  roomTwoChatters,
  mainChatRooms,
  populateRoom,
  populateChatters,
  options,
};