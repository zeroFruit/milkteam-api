import expect   from 'expect';
import request  from 'supertest';
import {app}    from '../app';
import Code     from '../config/responseCode';
import {
  videos, populateVideos, matches, populateMatches
} from './seed/setup';

import {Match} from '../models/match';

beforeEach(populateVideos);
beforeEach(populateMatches);

describe('Model Match test', () => {
  it('is upLike test', (done) => {
    Match.upLikes(matches[0].videosId, 'LEFT').then(() => {
      Match.findOne({videosId: matches[0].videosId}).then((match) => {
        expect(match.lLikes).toBe(1);
        done();
      });
    }).catch((e) => done(e));
  });

  it('is downLike test', (done) => {
    Match.update({videosId: matches[0].videosId}, {$inc: {lLikes: 1}}).then(() => {

      Match.downLikes(matches[0].videosId, 'LEFT').then(() => {
        Match.findOne({videosId: matches[0].videosId}).then((match) => {
          expect(match.lLikes).toBe(0);
          done();
        }).catch((e) => done(e));
      })
    })
  });

  it('is downLike but not negative number test', (done) => {
    Match.downLikes(matches[0].videosId, 'LEFT').then(() => {
      Match.findOne({videosId: matches[0].videosId}).then((match) => {
        expect(match.lLikes).toBe(0);
        done();
      }).catch((e) => done(e));
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
