import expect                 from 'expect';
import request                from 'supertest';

import {app}                  from '../app';
import Code                   from '../config/responseCode';
import {users, populateUsers, videos, populateVideos} from './seed/setup';
import {uploadVideo}          from '../controller/video';
import {Video}                from '../models/video';
import {User}                 from '../models/user';

beforeEach(populateUsers);
beforeEach(populateVideos);

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
      });
    }).catch((e) => {
      console.log(e);
      done(e);
    })
  });

  it('should delete video and return', (done) => {
    Video.delete(videos[0].videoId).then((video) => {
      expect(video).toInclude(videos[0]);

      Video.find({}).then((videos) => {
        expect(videos.length).toBe(1);
        done();
      })
    }).catch((e) => {
      console.log(e);
      done(e);
    })
  });
});

describe('POST /video', () => {
  it('should upload a new video', (done) => {
    const body = {
      video: {
        title: 'newVideo',
        content: 'newVideoContent',
        videoId: 'newVideoId',
        champion: 'newVideoChamp',
        position: 'newVideoPos',
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
        expect(res.body.data).toInclude(body.video);
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
          return done(err);
        }

        Video.findOne({videoId: body.video.videoId}).then((video) => {
          expect(video).toInclude(body.video);

          User.findById(users[0]._id).populate('videos').then((user) => {
            expect(user.videos[0]).toInclude(body.video);

            done();
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
        expect(res.body.data).toInclude(videos[0]);
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
          return done(err);
        }

        Video.find({}).then((videos) => {
          expect(videos.length).toBe(1);

          User.findById(users[0]._id).populate('videos').then((user) => {
            expect(user.videos.length).toBe(0);

            done();
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
        expect(res.body.data).toInclude({title: 'newVideo'});
      })
      .end(done);
  });
});
