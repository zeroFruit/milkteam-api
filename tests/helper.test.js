import expect from 'expect';
import helper from '../helpers/helper';
import {getThumbnailFromId, getYTDuration} from '../helpers/youtubeHelper';
import {
  videos,
  populateVideos,
  matches,
  populateMatches
} from './seed/setup';
import {Video} from '../models/video';
import {Match} from '../models/match';

beforeEach(populateVideos);
beforeEach(populateMatches);

describe('helpers test', () => {
  it('is isRealString', () => {
    let number = 123;
    let emptyString = '  ';
    let realString = 'realString';

    expect(helper.isRealString(number)).toBe(false);
    expect(helper.isRealString(emptyString)).toBe(false);
    expect(helper.isRealString(realString)).toBe(true);
  });

  it('is generateMessage', () => {
    let from = 'JooHyung';
    let msg = 'Some text';
    let message = helper.generateMessage(from, msg);

    expect(message).toInclude({from, msg});
  });

  // it('is is getMainVideoHelper test', (done) => {
  //   const preference = {
  //     character: 'videoOneChamp',
  //     position: 'videoOnePos',
  //     tier: 'VideoTwoTier'
  //   };
  //
  //   Video.getVideos().then((videos) => {
  //     let len;
  //     let mainVideo = helper.getMainVideoHelper(preference, videos);
  //
  //     if (mainVideo.length > helper.NUMBER_OF_MAIN_VIDEOS) {
  //       len = helper.NUMBER_OF_MAIN_VIDEOS;
  //     } else {
  //       len = mainVideo.length;
  //     }
  //
  //     expect(mainVideo[0]).toInclude({title: videos[0].title, content: videos[0].content});
  //     done();
  //   }).catch((e) => done(e));
  // });

  it('is removeMatchesWithVideoId test', (done) => {
    const videoId = videos[0].videoId;

    Match.find({}).populate('videos').then((matches) => {
      let videosId = helper.removeMatchesWithVideoId(matches, videoId);

      expect(videosId[0]).toEqual(matches[0].videosId);
      done();
    }).catch((e) => done(e));
  });

  it('is removeMatchesWithVideoId empty test', (done) => {
    const videoId = 'NotIncluded!';

    Match.find({}).populate('videos').then((matches) => {
      let videosId = helper.removeMatchesWithVideoId(matches, videoId);

      expect(videosId.length).toBe(0);
      done();
    }).catch((e) => done(e));
  })
});

describe('Youtube API Helper', () => {
  it('should return thumbnail link from video id', () => {
    const videoId = "GPexqi3flNM";
    getThumbnailFromId(videoId).then((link) => {
      expect(link).toEqual('https://i.ytimg.com/vi/GPexqi3flNM/default.jpg');
    }).catch((e) => {
      console.log(e);
    })
  });

  it('should return duration from video id', (done) => {
    const videoId = "r9mRaShIphg";
    getYTDuration(videoId).then((duration) => {
      expect(duration).toEqual('1h 2m 39s');
      done();
    }).catch((e) => {
      console.log(e);
      done(e);
    });
  })
});
