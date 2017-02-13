import {server} from '../app';
import expect from 'expect';
import {
  chatters,
  mainChatRooms,
  populateRoom,
  options,
  SOCKET_URL
} from './seed/socket.setup.js';
import io from 'socket.io-client';
import io_server from 'socket.io';

describe('Socket.io', () => {
  let socket;

  it('should successfully connected to socket server', (done) => {
    socket = io.connect(SOCKET_URL, options);

    socket.on('hello', ({message}) => {
      expect(message).toBe('hello');
      done();
    });
  });
});
