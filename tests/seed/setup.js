import {ObjectID} from 'mongodb';
import jwt        from 'jsonwebtoken';

import {User}     from '../../models/user';
import {Video}    from '../../models/video';

const userOneId = new ObjectID();
const userTwoId = new ObjectID();


const users = [{
  _id: userOneId,
  email: 'userOne@example.com',
  password: 'userOnePass',
  displayName: 'displayNameOne',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }],
  videos: []
}, {
  _id: userTwoId,
  email: 'userTwo@example.com',
  password: 'userTwoPass',
  displayName: 'displayNameTwo',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }],
  videos: []
}];

const videoOneId = new ObjectID();
const videoTwoId = new ObjectID();

const videos = [{
  _id: videoOneId,
  title: 'videoOneTitle',
  content: 'videoOneContent',
  videoId: 'videoOneId',
  champion: 'videoOneChamp',
  position: 'videoOnePos',
  tier: 'videoOneTier',
  attribute: 'videoOneAttribute'
}, {
  _id: videoTwoId,
  title: 'videoTwoTitle',
  content: 'videoTwoContent',
  videoId: 'videoTwoId',
  champion: 'videoTwoChamp',
  position: 'videoTwoPos',
  tier: 'videoTwoTier',
  attribute: 'videoTwoAttribute'
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

const populateVideos = (done) => {
  Video.remove({}).then(() => {
    let videoOne = new Video(videos[0]).save();
    let videoTwo = new Video(videos[1]).save();

    return Promise.all([videoOne, videoTwo]);
  }).then(() => done());
};

module.exports = {users, populateUsers, videos, populateVideos};
