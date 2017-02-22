import expect                 from 'expect';
import request                from 'supertest';

import {app}                  from '../app';
import Code                   from '../config/responseCode';
import {
  users,
  populateUsers,
  videos,
  populateVideos,
  matches,
  populateMatches,
  populateMainChats,
  populateSubChats
} from './seed/setup';
import {uploadVideo}          from '../controller/video';
import {Video}                from '../models/video';
import {User}                 from '../models/user';
import {Match}                from '../models/match';
import {MainChatRoom}         from '../models/mainChat';
import {SubChat}              from '../models/subChat';
import {matchingHelper, NUMBER_OF_MAIN_VIDEOS}       from '../helpers/helper';

beforeEach(populateUsers);
beforeEach(populateVideos);
beforeEach(populateMatches);
beforeEach(populateMainChats);
beforeEach(populateSubChats);

describe('Model Video test', () => {
  it('should upload new video and return', (done) => {
    const videoSchema = {
      title: 'newVideo',
      content: 'newVideoContent',
      videoId: 'newVideoId',
      champion: 'newVideoChamp',
      position: 'newVideoPos',
      tier: 'newVideoTier',
      attribute: 'newVideoAttriute'
    };
    const video = new Video(videoSchema);
    video.upload().then((video) => {
      expect(video).toInclude(videoSchema);

      Video.findOne({videoId: videoSchema.videoId}).then((video) => {
        expect(video).toInclude(videoSchema);
        done();
      }).catch((e) => done(e));
    });
  });

  it('should delete video and return', (done) => {
    Video.delete(videos[0].videoId).then((video) => {
      expect(video).toExclude({position: videos[0].position, tier: videos[0].tier, attribute: videos[0].attribute});

      Video.find({}).then((videos) => {
        expect(videos.length).toBe(5);
        done();
      })
    }).catch((e) => {
      console.log(e);
      done(e);
    })
  });

  it('is Video.match success test', (done) => {
    Video.match(videos[0].videoId).then((enemy) => {
      expect(enemy.videoId).toEqual(videos[4].videoId);
      Video.find({
        $or: [{videoId: enemy.videoId}, {videoId: videos[0].videoId}]
      }).then((videos) => {
        expect(videos[0].matched).toBe(true);
        expect(videos[1].matched).toBe(true);
        done();
      }).catch((e) => done(e));
    });
  });

  it('is Video.match fail test - non target case', (done) => {
    const notExistVideoId = 'notExistVideoId';

    Video.match(notExistVideoId).then((enemy) => {
      expect(enemy).toEqual({});
      done();
    }).catch((e) => done(e));
  });

  it('is Video.match fail test - videos length is 0', (done) => {
    Video.match(videos[1].videoId).then((enemy) => {
      expect(enemy).toEqual({});
      done();
    }).catch((e) => done(e));
  });

  it('is getOwner test', (done) => {
    Video.getOwner(videos[5].videoId).then((owner) => {
      expect(owner).toEqual(users[0]._id);
      done();
    })
  });

  it('is getVideos test', (done) => {
    Video.getVideos().then((rVideos) => {
      expect(rVideos.length).toBe(6);
      expect(rVideos[0]).toInclude({title: videos[0].title, content: videos[0].content, videoId: videos[0].videoId});
      expect(rVideos[0]).toExclude({position: videos[0].position});
      done();
    }).catch((e) => done(e));
  });

  it('is updateBothMatchProperty test', (done) => {
    Video.updateBothMatchProperty(videos[0]._id, videos[1]._id, matches[0]._id).then(() => {
      Video.find({$or: [{_id: videos[0]._id}, {_id: videos[1]._id}]}).then((videos) => {
        expect(videos[0]).toInclude({match: matches[0]._id});
        expect(videos[1]).toInclude({match: matches[0]._id});
        done();
      });
    })
  })
});

describe('POST /video', () => {
  it('should upload a new video', (done) => {
    const body = {
      video: {
        title: 'newVideo',
        content: 'newVideoContent',
        videoId: 'GPexqi3flNM',
        champion: 'videoOneChamp',
        position: 'videoOnePos',
        tier: 'newVideoTier',
        attribute: 'newVideoAttriute'
      }
    };
    request(app)
      .post('/video')
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.POST_VIDEO_SUCCESS);
        expect(res.body.data).toExclude({position: body.video.position, tier: body.video.tier, attribute: body.video.attribute});
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
          return done(err);
        }

        Video.findOne({videoId: body.video.videoId}).then((video) => {
          expect(video).toInclude(body.video);
          expect(video.thumbnail).toEqual('https://i.ytimg.com/vi/GPexqi3flNM/default.jpg');

          User.findById(users[0]._id).populate('videos').then((user) => {
            expect(user.videos[0]).toInclude(body.video);
            MainChatRoom.findOne({videoId: body.video.videoId}).then((chatroom) => {
              expect(chatroom).toExist();

              Match.findById(video.match).then((match) => {
                expect(match).toExist();
                done();
              });
            })
          })
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /video', () => {
  it('should delete a video', (done) => {
    request(app)
      .delete('/video')
      .set('x-auth', users[0].tokens[0].token)
      .send({videoId: videos[0].videoId})
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.DELETE_VIDEO_SUCCESS);
        expect(res.body.data).toExclude({position: videos[0].position, tier: videos[0].tier, attribute: videos[0].attribute});
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
          return done(err);
        }

        Video.find({}).then((videos) => {
          expect(videos.length).toBe(5);

          User.findById(users[0]._id).populate('videos').then((user) => {
            expect(user.videos.length).toBe(0);

            // 관련 경쟁영상도 삭제되었는지 테스트
            Match.find({}).then((matches) => {
              expect(matches.length).toBe(1);
              done();
            })
          })
        }).catch((e) => done(e));
      });
  });

  it('should throw error if there is no target video', (done) => {
    request(app)
      .delete('/video')
      .set('x-auth', users[0].tokens[0].token)
      .send({videoId: 'FAKE_VIDEO_ID'})
      .expect(400)
      .end(done);
  });
});

describe('GET /video', () => {
  beforeEach((done) => {
    const videoSchema = {
      title: 'newVideo',
      content: 'newVideoContent',
      videoId: 'newVideoId',
      champion: 'newVideoChamp',
      position: 'newVideoPos',
      tier: 'newVideoTier',
      attribute: 'newVideoAttriute'
    };
    const video = new Video(videoSchema);

    User.findById(users[0]._id).then((user) => {
      user.uploadVideo(video).then((video) => {
        video.upload().then(() => done());
      });
    });
  });

  it('should get user\'s video.', (done) => {
    request(app)
      .get('/video')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0]).toInclude({title: 'newVideo'});
      })
      .end(done);
  });
});

describe('GET /video/main', () => {
  it('should get proper mainVideo who has accessToken', (done) => {
    const preference = {
      character: 'videoOneChamp',
      position: 'videoOnePos',
      tier: 'VideoTwoTier'
    };

    request(app)
      .get('/video/main')
      .set('x-auth', users[0].tokens[0].token)
      .query(preference)
      .expect(200)
      .expect((res) => {
        let len;

        if (res.body.data.length > NUMBER_OF_MAIN_VIDEOS) {
          len = NUMBER_OF_MAIN_VIDEOS;
        } else {
          len = res.body.data.length;
        }
        expect(res.body.code).toBe(Code.GET_VIDEO_SUCCESS);
        expect(res.body.data[0]).toInclude({title: videos[0].title, content: videos[0].content});
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
          done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.preference.length).toBe(1);
          expect(user.preference[0]).toInclude(preference);
          done();
        }).catch((e) => done(e));
      })
  });

  it('should get proper mainVideos who has not accessToken', (done) => {
    const preference = {
      character: 'videoOneChamp',
      position: 'videoOnePos',
      tier: 'VideoTwoTier'
    };

    request(app)
      .get('/video/main')
      .query(preference)
      .expect(200)
      .expect((res) => {
        let len;

        if (res.body.data.length > NUMBER_OF_MAIN_VIDEOS) {
          len = NUMBER_OF_MAIN_VIDEOS;
        } else {
          len = res.body.data.length;
        }
        expect(res.body.code).toBe(Code.GET_VIDEO_SUCCESS);
        expect(res.body.data[0]).toInclude({title: videos[0].title, content: videos[0].content});
      })
      .end(done);
  });
});
