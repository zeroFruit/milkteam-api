import expect   from 'expect';
import request  from 'supertest';
import {app}    from '../app';
import Code     from '../config/responseCode';
import {
  users, populateUsers, videos, populateVideos, matches, populateMatches
} from './seed/setup';

import {Match} from '../models/match';

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
