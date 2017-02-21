import expect     from 'expect';
import request    from 'supertest';
import faker      from 'faker';

import {app}      from '../app';
import {User}     from '../models/user';
import {Video}    from '../models/video';
import {users, populateUsers, videos, populateVideos} from './seed/setup';
import Code from '../config/responseCode';


describe('POST /users', () => {
  beforeEach(populateUsers);

  it('should create a user', (done) => {
    let email = faker.internet.email();
    let password = faker.random.number();
    let displayName = faker.internet.userName();

    request(app)
      .post('/users')
      .send({email, password, displayName})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.data._id).toNotExist();
        expect(res.body.data.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          //expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create user if email in use', (done) => {
    let email = users[0].email;
    let password = faker.random.number();
    let displayName = faker.internet.userName();
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.data.email).toEqual(users[1].email);
        expect(res.body.data.displayName).toEqual(users[1].displayName);
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      })
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe.only('GET /users', () => {
  it('should get user info', (done) => {
    request(app)
      .get('/users')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.GET_USER_SUCCESS);
        expect(res.body.data).toInclude({email: users[0].email, displayName: users[0].displayName});
      })
      .end(done);
  });
});

describe('User video association test', () => {
  it('should add new video into the list', (done) => {
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

    User.findOne({email: users[0].email}).then((user) => {
      user.uploadVideo(video).then((video) => {
        video.upload().then((video) => {
          User.findOne({email: users[0].email}).populate('videos')
            .then((user) => {
              expect(user.videos[0]).toInclude(videoSchema);

              done();
            });
        }).catch((e) => {
          console.log(e);
          done(e);
        })
      });
    })
  });

  it('should delete video from the list', (done) => {
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

    User.findOne({email: users[0].email}).then((user) => {
      user.uploadVideo(video).then((video) => {
        user.deleteVideo(video).then((video) => {
          User.findOne({email: users[0].email}).populate('videos')
            .then((user) => {
              expect(user.videos.length).toBe(0);

              done();
            })
            .catch((e) => {
              console.log(e);
              done(e)
            });
        })
      })
    })
  });
});
