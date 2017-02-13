import {MainChatRoom} from '../../models/mainChat';

const socketURL = 'http://localhost:3000';
const option = {
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

module.exports = {chatters, mainChatRooms, populateRoom, option, socketURL};
