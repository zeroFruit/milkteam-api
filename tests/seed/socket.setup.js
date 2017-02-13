import {MainChatRoom} from '../../models/mainChat';

const SOCKET_URL = 'http://ec2-52-78-175-43.ap-northeast-2.compute.amazonaws.com:3000';
const options = {
  path: '/api/socket/main'
};

const chatters = [{
  id: 'ChatterIdOne',
  displayName: 'ChatterOne',
  anonymous: true
}, {
  id: 'ChatterIdTwo',
  displayName: 'ChatterTwo',
  anonymous: true
}, {
  id: 'ChatterIdThree',
  displayName: 'ChatterThree',
  anonymous: true
}
];

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
