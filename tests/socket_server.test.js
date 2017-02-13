import {server} from '../app';
import expect from 'expect';
import {
  chatters,
  mainChatRooms,
  populateRoom,
  options,
  SOCKET_URL
} from './seed/socket.setup';
import {
  users,
  populateUsers
} from './seed/setup';
import io from 'socket.io-client';
import io_server from 'socket.io';



describe('Socket.io', () => {
  let socket1, socket2;

  beforeEach(populateRoom);
  beforeEach(populateUsers);

  // afterEach((done) => {
  //   if (socket1 !== undefined || socket1.connected) {
  //     socket1.disconnect();
  //   }
  //   if (socket1 !== undefined || socket2.connected) {
  //     socket2.disconnect();
  //   }
  //   done();
  // });

  it('should successfully connect to socket server', (done) => {
    let socket1 = io.connect(SOCKET_URL, options);

    socket1.disconnect();
    done();
  });

  it('should alert/welcome new user', () => {
    let socketId1;
    let params = [{
      videoId: mainChatRooms.videoId,
      user: {
        token: users[0].tokens[0].token
      }
    }, {
      videoId: mainChatRooms.videoId,
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
});
