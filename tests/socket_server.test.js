import {server} from '../app';
import expect from 'expect';
import {
  SOCKET_URL,
  TEST_MAIN_CHAT_KEY,
  roomOneChatters,
  roomTwoChatters,
  mainChatRooms,
  populateRoom,
  populateChatters,
  options
} from './seed/socket.setup';
import {
  users,
  populateUsers
} from './seed/setup';
import io from 'socket.io-client';

describe.skip('Socket.io', () => {


  beforeEach(populateRoom);
  beforeEach(populateUsers);
  beforeEach(populateChatters);

  it('should successfully connect to socket server at main chat path', (done) => {
    let socket1 = io.connect(SOCKET_URL, options);

    socket1.disconnect();
    done();
  });

  it('should alert/welcome new user in main chatting', (done) => {
    let socket1, socket2, count = 0;
    let params = [{
      videoId: mainChatRooms[0].videoId,
      user: {
        token: users[0].tokens[0].token
      }
    }, {
      videoId: mainChatRooms[0].videoId,
      user: {
        token: users[1].tokens[0].token
      }
    }];

    socket1 = io.connect(SOCKET_URL, options);

    socket1.on('newMessage', ({msg}) => {
      if (count === 0) {
        expect(msg).toEqual(`WELCOME MESSAGE TO displayNameOne`);
      } else if (count === 1) {
        expect(msg).toEqual('NEW USER ALERT MESSAGE');

        socket1.disconnect();
        socket2.disconnect();
        done()
      }
    });

    socket1.emit('join', params[0], () => {
      socket2 = io.connect(SOCKET_URL, options);
      count++;

      socket2.emit('join', params[1], () => {
        console.log('socket2 joined!');
      });
    });
  });

  it('should create message in the same main chatting room', (done) => {
    const MSG = 'Text from socket2';
    let socket1, socket2, count = 0;
    let params = [{
      videoId: mainChatRooms[0].videoId,
      user: {
        token: users[0].tokens[0].token
      }
    }, {
      videoId: mainChatRooms[0].videoId,
      user: {
        token: users[1].tokens[0].token
      }
    }];

    socket1 = io.connect(SOCKET_URL, options);
    socket1.on('newMessage', ({msg}) => {
      count++;
      if (count === 3) {
        expect(msg).toEqual(MSG);

        socket1.disconnect();
        socket2.disconnect();
        done();
      }
    });

    socket1.emit('join', params[0], () => {
      socket2 = io.connect(SOCKET_URL, options);

      socket2.emit('join', params[1], () => {
        socket2.emit('createMessage', {text: MSG});
      });
    });
  });

  xit('should create private message in the different main chatting room', () => {

  });
});
