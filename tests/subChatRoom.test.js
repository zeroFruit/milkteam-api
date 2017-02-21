import expect from 'expect';
import {server} from '../app';
import {SubChatRoom} from '../models/subChat';
import {
  roomOneChatters,
  roomTwoChatters,
  subChatRooms,
  populateRoom,
  populateSubRoom
} from './seed/socket.setup.js';

describe.skip('Sub-Chatroom test', () => {

  beforeEach(populateRoom);
  beforeEach(populateSubRoom);

  it('should add chatter to room', (done) => {
    const newChatter = {
      id: 'NewChatter',
      displayName: 'NewChatter',
      anonymous: true
    };

    SubChatRoom.addChatter(subChatRooms[0].videoId, newChatter).then((chatter) => {
        SubChatRoom.findOne({ videoIds: subChatRooms[0].videoId }).then((room) => {
          expect(room.chatters.length).toBe(4);
          expect(room.chatters[3].id).toEqual('NewChatter');
          done();
        }).catch((e) => {
          console.log(e);
          done(e);
        })
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

  it('is SubChatRoom.addLeftChat Test', (done) => {
    const chat = {displayName: 'JooHyung', text: 'AddLeftChat test'};

    SubChatRoom.addLeftChat(subChatRooms[0].videoId, chat).then(() => {
      SubChatRoom.findOne({videoId: subChatRooms[0].videoId}).then((room) => {
        expect(room.lChat.length).toBe(1);
        expect(room.lChat[0].displayName).toEqual(chat.displayName);
        expect(room.lChat[0].text).toEqual(chat.text);
        done();
      }).catch((e) => done(e));
    })
  });

  it('is SubChatRoom.addRightChat Test', (done) => {
    const chat = {displayName: 'JooHyung', text: 'AddRightChat test'};

    SubChatRoom.addRightChat(subChatRooms[0].videoId, chat).then(() => {
      SubChatRoom.findOne({videoId: subChatRooms[0].videoId}).then((room) => {
        expect(room.rChat.length).toBe(1);
        expect(room.rChat[0].displayName).toEqual(chat.displayName);
        expect(room.rChat[0].text).toEqual(chat.text);
        done();
      }).catch((e) => done(e));
    })
  });

  it('is SubChatRoom.getLeftChat Test', (done) => {
    const chat = {displayName: 'JooHyung', text: 'getLeftChat test'};

    SubChatRoom.addLeftChat(subChatRooms[0].videoId, chat).then(() => {
      SubChatRoom.getLeftChat(subChatRooms[0].videoId).then((chats) => {
        expect(chats.length).toBe(1);
        expect(chats[0].displayName).toEqual(chat.displayName);
        expect(chats[0].text).toEqual(chat.text);
        done();
      });
    });
  });

  it('is SubChatRoom.getRightChat Test', (done) => {
    const chat = {displayName: 'JooHyung', text: 'getRightChat test'};

    SubChatRoom.addRightChat(subChatRooms[0].videoId, chat).then(() => {
      SubChatRoom.getRightChat(subChatRooms[0].videoId).then((chats) => {
        expect(chats.length).toBe(1);
        expect(chats[0].displayName).toEqual(chat.displayName);
        expect(chats[0].text).toEqual(chat.text);
        done();
      });
    });
  });
});
