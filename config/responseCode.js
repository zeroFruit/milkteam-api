const responseCode = {
  POST_USER_SUCCESS:              0,
  POST_USER_FAIL:                 1,
  POST_USER_LOGIN_SUCCESS:        2,
  POST_USER_LOGIN_FAIL:           3,
  DELETE_USER_SUCCESS:            4,
  DELETE_USER_FAIL:               5,
  GET_USER_SUCCESS:               6,
  GET_USER_FAIL:                  7,
  AUTHENTICATE_FAIL:              8,

  POST_VIDEO_SUCCESS:             10,
  POST_VIDEO_FAIL:                11,
  DELETE_VIDEO_SUCCESS:           12,
  DELETE_VIDEO_FAIL:              13,
  GET_VIDEO_SUCCESS:              14,
  GET_VIDEO_FAIL:                 15,
  VIDEO_NOT_FOUND:                16,

  GET_CHATS_SUCCESS:              20,
  GET_CHATS_FAIL:                 21,

  PUT_MATCH_SUCCESS:              30,
  PUT_MATCH_FAIL:                 31,

  DOCS_NOT_FOUND:                 100
};

module.exports = responseCode;
