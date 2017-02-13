import {MainChatRoom} from '../../models/mainChat';
import {users}        from './setup';
import jwt            from 'jsonwebtoken';

const SOCKET_URL = 'http://ec2-52-78-175-43.ap-northeast-2.compute.amazonaws.com:3000';
const options = {
  path: '/api/socket/main'
};

const CHATTER_ONE_ID = 'ChatterIdOne';
const CHATTER_TWO_ID = 'ChatterIdTwo';
const CHATTER_THREE_ID = 'ChatterIdThree';

const chatters = [{
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

const mainChatRooms = {
  videoId: 'videoIdOne',
  chatters: chatters
};

const populateRoom = (done) => {
  MainChatRoom.remove({}).then(() => {
    MainChatRoom(mainChatRooms).save()
      .then(() => done())
      .catch((e) => done(e));
  });
};

module.exports = {chatters, mainChatRooms, populateRoom, options, SOCKET_URL};
