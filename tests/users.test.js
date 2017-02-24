import expect     from 'expect';
import request    from 'supertest';
import faker      from 'faker';

import {app}      from '../app';
import {User}     from '../models/user';
import {Video}    from '../models/video';
import {Match}    from '../models/match';
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

describe('GET /users', () => {
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
      desc: 'newVideoContent',
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
      desc: 'newVideoContent',
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

describe('updateProfile test', () => {
  it('should successfully update profile sub-doc', (done) => {
    const profile = {
      key: 'profileName',
      tag: 'profileTag',
      link: 'profileLink'
    };

    User.updateProfile(users[0]._id, profile).then(() => {
      User.findById(users[0]._id).then((user) => {
        expect(user.profile[0]).toInclude(profile);
        done();
      }).catch((e) => done(e));
    });
  });

  it('should successfully update profile when there is already profile image', (done) => {
    const profile1 = {
      key: 'profileName1',
      tag: 'profileTag1',
      link: 'profileLink1'
    };
    const profile2 = {
      key: 'profileName2',
      tag: 'profileTag2',
      link: 'profileLink2'
    };

    User.updateProfile(users[0]._id, profile1).then(() => {
      User.updateProfile(users[0]._id, profile2).then(() => {
        User.findById(users[0]._id).then((user) => {
          expect(user.profile.length).toBe(1);
          expect(user.profile[0]).toInclude(profile2);
          done();
        })
      })
    }).catch((e) => done(e));
  })
});


describe('GET /users/displayname/doublecheck', () => {
  it('should respond fail', (done) => {
    request(app)
      .get('/users/displayname/doublecheck')
      .set('x-auth', users[0].tokens[0].token)
      .query({displayName: users[0].displayName})
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.GET_USER_SUCCESS);
        expect(res.body.data).toBe('fail');
      })
      .end(done);
  });

  it('should respond success', (done) => {
    request(app)
      .get('/users/displayname/doublecheck')
      .set('x-auth', users[0].tokens[0].token)
      .query({displayName: 'totalDifferentDisplayName'})
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.GET_USER_SUCCESS);
        expect(res.body.data).toBe('success');
      })
      .end(done);
  })
});

describe('PUT /users/displayname', () => {
  it('should update displayname', (done) => {
    const newDisplayName = { displayName: 'updatedDisplayName' };

    request(app)
      .put('/users/displayname')
      .set('x-auth', users[0].tokens[0].token)
      .send(newDisplayName)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.PUT_USER_SUCCESS);
        expect(res.body.data).toBe(newDisplayName.displayName);
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
          done(err)
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.displayName).toEqual(newDisplayName.displayName);
          done();
        }).catch((e) => done());
      })
  });
});

describe('User Model test', () => {
  it('is getVideos test', (done) => {
    let userTest = new User({email: 'getVideosTest@example.com', password: 'getVideosTest', displayName: 'getVideosTest'});
    let videoTest = new Video({
      videoId: 'getVideosTest',
      title: 'getVideosTest',
      desc: 'getVideosTest',
      champion: 'getVideosTest',
      position: 'getVideosTest',
      tier: 'getVideosTest',
      attribute: 'getVideosTest',
      title: 'getVideosTest'
    });
    let matchTest = new Match({videosId: 'getVideosTest'});

    userTest.videos.push(videoTest);
    videoTest.match = matchTest;

    Promise.all([userTest.save(), videoTest.save(), matchTest.save()]).then(() => {
      User.getVideos(userTest._id)
        .then(() => done())
        .catch((e) => {
          console.log(e);
          done(e);
        })
    })
  })
});
