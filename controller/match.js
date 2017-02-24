import Code from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import {Match} from '../models/match';
import {getPercentage} from '../helpers/helper';
import { setHistory, getHistory } from '../helpers/videoHistory';

/*
  {
    isLike: 1 / -1,
    videos: {
      id, // videosId
      which // -1 / 1
    }
  }
*/
const LIKE = 1;
const DISLIKE = -1;

async function updateLikes (req, res) {
  let {isLike, videos: { id, which } } = req.body;
  let likes, percentage;
  try {
    if (isLike === LIKE) {
      likes = await Match.upLikes(id, which)
    } else if (isLike === DISLIKE) {
      likes = await Match.downLikes(id, which);
    }

    if (likes) {
      percentage = getPercentage(likes);
    } else {
      percentage = {};
    }

    res.json({code: Code.PUT_MATCH_SUCCESS, data: {likes, percentage}});
  } catch (e) {
    if (e === -1) {
      responseByCode(res, Code.DOCS_NOT_FOUND, 400);
    } else {
      responseByCode(res, Code.PUT_MATCH_FAIL, 400);
    }
  }
}

/*
  {
    videos: {
      id
    }
  }
*/
async function updateViews (req, res) {
  let {videos: {id}} = req.body;

  try {
    let views = await Match.viewed(id);

    res.json({code: Code.PUT_MATCH_SUCCESS, data: views});
  } catch (e) {
    console.log(e);
    responseByCode(res, Code.PUT_MATCH_FAIL, 400);
  }
}

/*
  position, page
*/
async function getFilteredMatches (req, res) {
  let {position, page} = req.query;

  try {
    if (page) {
      page = parseInt(page);
    }

    let match = await Match.getLatestMatch(position, page);

    // match data 필터링 해주기

    // redis에 history 추가해주기
    if (req.user && req.token) {
      await setHistory(req.user._id, match[0].videosId);
    }

    res.json({
      code: Code.GET_MATCH_SUCCESS,
      data: match
    });
  } catch (e) {
    responseByCode(res, Code.GET_MATCH_FAIL, 400);
  }
}

async function getMatchHistory (req, res) {
  try {
    let history = await getHistory(req.user._id);

    if (history) {
      history = history.map((elt) => {
        return elt.split("-")[1];
      });

      history = await Match.getMatchesFromIds(history);
    } else {
      history = [];
    }

    res.json({
      code: Code.GET_MATCH_SUCCESS,
      data: history
    });
  } catch (e) {
    responseByCode(res, Code.GET_MATCH_FAIL, 400);
  }
}

async function getMatchById (req, res) {
  try {
    let match = await Match.findOne({videosId: req.params.id});

    // match data 필터링 해주기

    res.json({
      code: Code.GET_MATCH_SUCCESS,
      data: match
    });
  } catch (e) {
    responseByCode(res, Code.GET_MATCH_FAIL, 400);
  }
}

module.exports = {
  updateLikes,
  updateViews,
  getFilteredMatches,
  getMatchHistory,
  getMatchById
};
