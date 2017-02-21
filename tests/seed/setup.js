import {ObjectID} from 'mongodb';
import jwt        from 'jsonwebtoken';

import {User}     from '../../models/user';
import {Video}    from '../../models/video';
import {Match}    from '../../models/match';
import {MainChatRoom} from '../../models/mainChat';

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
const videoThreeId = new ObjectID();
const videoFourId = new ObjectID();
const videoFiveId = new ObjectID();
const videoSixId = new ObjectID();

const videos = [{
  // object for matching test : target
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
}, {
  // object for matching test : point under 2
  _id: videoThreeId,
  title: 'videoThreeTitle',
  content: 'videoThreeContent',
  videoId: 'videoThreeId',
  champion: 'videoThreeChamp',
  position: 'videoThreePos',
  tier: 'videoThreeTier',
  attribute: 'videoThreeAttribute'
}, {
  // object for matching test : point over 2
  _id: videoFourId,
  title: 'videoFourTitle',
  content: 'videoFourContent',
  videoId: 'videoFourId',
  champion: 'videoOneChamp', // same
  position: 'videoOnePos',   // same
  tier: 'videoFourTier',
  attribute: 'videoFourAttribute'
}, {
  // object for matching test : point over 2
  _id: videoFiveId,
  title: 'videoFiveTitle',
  content: 'videoFiveContent',
  videoId: 'videoFiveId',
  champion: 'videoOneChamp', // same
  position: 'videoOnePos',   // same
  tier: 'videoOneTier',      // same
  attribute: 'videoFiveAttribute'
}, {
  // object for getOnwer test
  _id: videoSixId,
  title: 'videoSixTitle',
  content: 'videoSixContent',
  videoId: 'videoSixId',
  champion: 'videoSixChamp',
  position: 'videoSixPos',
  tier: 'videoSixTier',
  attribute: 'videoSixAttribute',
  owner: userOneId
}];

const matches = [{
  videosId: videos[0].videoId + videos[1].videoId,
  videos: [videos[0], videos[1]]
}, {
  videosId: videos[2].videoId + videos[3].videoId,
  videos: [videos[2], videos[3]],
  lLikes: 1,
  rLikes: 2,
  views: 3
}];

const mainChats = [{

}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]);
    let userTwo = new User(users[1]);

    return Promise.all([userOne.save(), userTwo.save()]).then(() => done());
  });
};

const populateVideos = (done) => {
  Video.remove({}).then(() => {
    let videoOne = new Video(videos[0]).save();
    let videoTwo = new Video(videos[1]).save();
    let videoThree = new Video(videos[2]).save();
    let videoFour = new Video(videos[3]).save();
    let videoFive = new Video(videos[4]).save();
    let videoSix  = new Video(videos[5]).save();

    return Promise.all([videoOne, videoTwo, videoThree, videoFour, videoFive, videoSix]).then(() => done());
  })
};

const populateMatches = (done) => {
  Match.remove({}).then(() => {
    let matchOne = new Match(matches[0]).save();
    let matchTwo = new Match(matches[1]).save();

    return Promise.all([matchOne, matchTwo]).then(() => done());
  });
};

const populateMainChats = (done) => {
  MainChatRoom.remove({}).then(() => {
    done();
  });
}

module.exports = {
  users,
  populateUsers,
  videos,
  populateVideos,
  matches,
  populateMatches,
  populateMainChats
};
