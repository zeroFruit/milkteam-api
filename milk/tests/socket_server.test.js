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

describe('Socket.io', () => {
  let socket1, socket2, socket3;

  beforeEach(populateRoom);
  beforeEach(populateUsers);
  beforeEach(populateChatters);

  it('should successfully connect to socket server at main chat path', (done) => {
    let socket1 = io.connect(SOCKET_URL, options);

    socket1.disconnect();
    done();
  });

  it('should alert/welcome new user in main chatting', () => {
    let socketId1;
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
    socketId1 = socket1.id;
    socket1.emit('join', params[0], () => {
      checkBroadcastMessage(socket1, () => {
        socket2 = io.connect(SOCKET_URL, options);
        socket2.emit('join', params[1], () => {
          disconnectAll();
        });
      });
    });

    const checkBroadcastMessage = (socket, callback) => {
      socket.on('newUser', ({msg}) => {
        if (socketId1 === socket.id) {
          expect(msg).toEqual('NEW USER ALERT MESSAGE');
          done();
        }
      });
      callback();
    };

    const disconnectAll = () => {
      socket1.disconnect();
      socket2.disconnect();
    }
  });

  it('should create message in the same main chatting room', (done) => {
    let socketId1, socketId2, count = 0;
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
    socketId1 = socket1.id;
    socket1.emit('join', params[0], () => {
      checkNewMessageSocket1(socket1, callDone)

      socket2 = io.connect(SOCKET_URL, options);
      socketId2 = socket2.id;
      socket2.emit('join', params[1], () => {
        checkNewMessageSocket2(socket2, callDone);

        socket2.emit('createMessage', { text: 'This is socket2' }, () => {
          socket1.emit('createMessage', { text: 'This is socket1' }, () => {
            //disconnectAll();
          })
        });
      });
    });

    const checkNewMessageSocket1 = (socket, callback) => {
      socket.on('newMessage', ({text}) => {
        expect(text).toBe('This is socket2');

        callback();
      });
    };

    const checkNewMessageSocket2 = (socket, callback) => {
      socket.on('newMessage', ({text}) => {
        expect(text).toBe('This is socket1');

        callback();
      })
    };

    const callDone = () => {
      count++;
      if (count === 2) {
        done();
      }
    };

    const disconnectAll = () => {
      socket1.disconnect();
      socket2.disconnect();
    };
  });

  xit('should create private message in the different main chatting room', () => {

  });
});
