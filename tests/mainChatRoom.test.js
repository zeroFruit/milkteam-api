import expect from 'expect';
import {server} from '../app';
import {MainChatRoom} from '../models/mainChat';
import {
  chatters,
  mainChatRooms,
  populateRoom
} from './seed/socket.setup.js';

describe('Main Chatroom test', () => {

  beforeEach(populateRoom);

  it('should add chatter to room', (done) => {
    const newChatter = {
      id: 'NewChatter',
      displayName: 'NewChatter',
      anonymous: true
    };

    MainChatRoom.addChatter(mainChatRooms.videoId, newChatter).then(() => {
        MainChatRoom.findOne({ videoId: mainChatRooms.videoId }).then((room) => {
          expect(room.chatters.length).toBe(4);
          expect(room.chatters[3].id).toEqual('NewChatter');
          done();
        });
      });
  });

  it('should remove chatter from room', (done) => {
    MainChatRoom.removeChatter(mainChatRooms.videoId, chatters[0].id).then(() => {
      MainChatRoom.findOne({videoId: mainChatRooms.videoId}).then((room) => {
        expect(room.chatters.length).toBe(2);
        done();
      })
    });
  });
});
