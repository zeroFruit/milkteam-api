import expect         from 'expect';
import request        from 'supertest';
import {app}          from '../app';
import {redisClient}  from '../config/redis';
import Code           from '../config/responseCode';
import {
  users, populateUsers, videos, populateVideos, matches, populateMatches
} from './seed/setup';

import {Match} from '../models/match';
import {setHistory, getHistory, removeHistory} from '../helpers/videoHistory';

beforeEach(populateUsers);
beforeEach(populateVideos);
beforeEach(populateMatches);

const LEFT_LIKES = -1;
const RIGHT_LIKES = 1;

describe('Model Match test', () => {
  it('is upLike test', (done) => {
    Match.upLikes(matches[0].videosId, LEFT_LIKES).then(({lLikes, rLikes}) => {
      expect(lLikes).toBe(1);
      expect(rLikes).toBe(0);
      done();
    }).catch((e) => done(e));
  });

  it('is downLike test', (done) => {
    Match.update({videosId: matches[0].videosId}, {$inc: {lLikes: 1}}).then(() => {

      Match.downLikes(matches[0].videosId, LEFT_LIKES).then(({lLikes, rLikes}) => {
        expect(lLikes).toBe(0);
        expect(rLikes).toBe(0);
        done();
      })
    })
  });

  it('is downLike but should not be a negative number test', (done) => {
    Match.downLikes(matches[0].videosId, LEFT_LIKES).then((doc) => {
      expect(doc).toNotExist();
      done();
    })
  });

  it('is viewed test', (done) => {
    Match.viewed(matches[0].videosId).then(() => {
      Match.findOne({videosId: matches[0].videosId}).then((match) => {
        expect(match.views).toBe(1);
        done();
      }).catch((e) => done(e));
    })
  });

  it('is getLatestMatch test', (done) => {
    let newMatch = new Match({videosId: 'newMatch', videos: [videos[0], videos[2]]});

    newMatch.save().then(() => {
      Match.getLatestMatch(videos[0].position).then((result) => {
        expect(result[0].videosId).toEqual(newMatch.videosId);
        done();
      }).catch((e) => {
        console.log(e);
        done(e);
      })
    })
  });
});

describe('PUT /match/likes', () => {
  it('return correct likes and percentage', (done) => {
    const body = {
      isLike: 1,
      videos: {
        id: matches[1].videosId,
        which: -1
      }
    };

    request(app)
      .put('/match/likes')
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.PUT_MATCH_SUCCESS);
        expect(res.body.data.likes).toEqual({lLikes: 2, rLikes: 2});
        expect(res.body.data.percentage).toEqual({lLikes: 0.5, rLikes: 0.5});
      })
      .end(done);
  });

  it('return correct likes and percentage - dislike test', (done) => {
    const body = {
      isLike: -1,
      videos: {
        id: matches[1].videosId,
        which: -1
      }
    };

    request(app)
      .put('/match/likes')
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.PUT_MATCH_SUCCESS);
        expect(res.body.data.likes).toEqual({lLikes: 0, rLikes: 2});
        expect(res.body.data.percentage).toEqual({lLikes: 0, rLikes: 1});
      })
      .end(done);
  });

  it('should return DOCS NOT FOUND error', (done) => {
    const body = {
      isLike: 1,
      videos: {
        id: 'STRANGE_ID',
        which: -1
      }
    };
    request(app)
      .put('/match/likes')
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe(Code.DOCS_NOT_FOUND);
      })
      .end(done);
  })
});

describe('PUT /match/views', () => {
  it('should return correct views', (done) => {
    const body = {
      videos: {
        id: matches[1].videosId
      }
    };

    request(app)
      .put('/match/views')
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(Code.PUT_MATCH_SUCCESS);
        expect(res.body.data).toBe(4);
      })
      .end(done);
  });
});

describe('GET /match', () => {
  it('should return match and save it to redis who has token', (done) => {
    let newMatch = new Match({videosId: 'newMatch', videos: [videos[0], videos[2]]});
    let key = `history:${users[0]._id}`;
    let value;

    newMatch.save().then(() => {
      request(app)
        .get('/match')
        .set('x-auth', users[0].tokens[0].token)
        .query({position: videos[0].position})
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(Code.GET_MATCH_SUCCESS);
          expect(res.body.data[0].videosId).toEqual('newMatch');
        })
        .end((err, res) => {
          if (err) {
            console.log(err);
            return done(err);
          }

          redisClient.lrange(key, 0, 1, (err, reply) => {
            if (err) {
              console.log(err);
              return done(err);
            }
            expect(reply[0].split("-")[1]).toEqual("newMatch");
            done();
          });
        });
    });
  });

  it('should return match who has not token', () => {

  });
});

describe('GET /match/history', () => {
  it('should return history', (done) => {
    const matchId = "matchHistory";
    let newMatch = new Match({videosId: matchId, videos: [videos[0], videos[2]]});

    newMatch.save().then(() => {
      setHistory(users[0]._id, matchId).then(() => {
        request(app)
          .get('/match/history')
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
            expect(res.body.code).toBe(Code.GET_MATCH_SUCCESS);
            expect(res.body.data[0].videosId).toEqual(matchId);
          })
          .end(done);
      });
    });
  });
});

describe('GET /match/:id', () => {
  it('should proper video that matching id', (done) => {
    let newMatch = new Match({videosId: "123", videos: [videos[0], videos[2]]});

    newMatch.save().then(() => {
      request(app)
        .get('/match/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.videosId).toEqual("123");
          expect(res.body.code).toBe(Code.GET_MATCH_SUCCESS);
        })
        .end(done);
    });
  });
});
