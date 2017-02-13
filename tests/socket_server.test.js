import expect from 'expect';
import {
  chatters,
  mainChatRooms,
  populateRoom,
  option,
  socketURL
} from './seed/socket.setup.js';
import mainChatSocket from '../socket/mainChat';
import {server} from '../app';
import io from 'socket.io-client';

describe('Main Chat Connection', () => {
  it('should successfully connected to socket server', (done) => {
    mainChatSocket.connect(server);
    let socket = io(socketURL, option);

    socket.on('connect', () => {
      console.log('client - Connected!');
      done();
    });

  });
});
