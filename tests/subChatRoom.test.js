import expect from 'expect';
import {server} from '../app';
import {SubChatRoom} from '../models/mainChat';
import {
  roomOneChatters,
  roomTwoChatters,
  subChatRooms,
  populateRoom
} from './seed/socket.setup.js';

describe('Sub Chatroom test', () => {

  beforeEach(populateRoom);

  it('should add chatter to room', (done) => {
    const newChatter = {
      id: 'NewChatter',
      displayName: 'NewChatter',
      anonymous: true
    };

    SubChatRoom.addChatter(subChatRooms[0].videoId, newChatter).then(() => {
        SubChatRoom.findOne({ videoId: subChatRooms[0].videoId }).then((room) => {
          expect(room.chatters.length).toBe(4);
          expect(room.chatters[3].id).toEqual('NewChatter');
          done();
        });
      });
  });

  it('should remove chatter from room', (done) => {
    SubChatRoom.removeChatter(subChatRooms[0].videoId, roomOneChatters[0]).then((chatter) => {
      SubChatRoom.findOne({videoId: subChatRooms[0].videoId}).then((room) => {
        expect(room.chatters.length).toBe(2);
        done();
      })
    });
  });
});
