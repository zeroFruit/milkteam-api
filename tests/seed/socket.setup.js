import {MainChatRoom} from '../../models/mainChat';
import {SubChatRoom}  from '../../models/subChat';
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

const roomOneChatters = [{
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
  chatters: roomOneChatters
}, {
  videoId: 'videoIdTwo',
  chatters: roomTwoChatters
}];

const subChatRooms = [{
  videoId: 'videoIdOne',
  chatters: roomOneChatters
}];

const populateRoom = (done) => {
  let saveMainRoom = MainChatRoom.remove({}).then(() => {
    MainChatRoom(mainChatRooms[0]).save().then(() => {
      MainChatRoom(mainChatRooms[1]).save();
    });
  });

  let saveSubRoom = SubChatRoom.remove({}).then(() => {
    SubChatRoom(subChatRooms[0]).save();
  })

  Promise.all([saveMainRoom, saveSubRoom]).then(() => done());
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
  roomOneChatters,
  roomTwoChatters,
  mainChatRooms,
  subChatRooms,
  populateRoom,
  populateChatters,
  options,
};
