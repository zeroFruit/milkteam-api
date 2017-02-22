const responseCode = {
  POST_USER_SUCCESS:              0,
  POST_USER_FAIL:                 1,
  POST_USER_LOGIN_SUCCESS:        2,
  POST_USER_LOGIN_FAIL:           3,
  DELETE_USER_SUCCESS:            4,
  DELETE_USER_FAIL:               5,
  GET_USER_SUCCESS:               6,
  GET_USER_FAIL:                  7,
  PUT_USER_SUCCESS:               8,
  PUT_USER_FAIL:                  9,

  POST_VIDEO_SUCCESS:             20,
  POST_VIDEO_FAIL:                21,
  DELETE_VIDEO_SUCCESS:           22,
  DELETE_VIDEO_FAIL:              23,
  GET_VIDEO_SUCCESS:              24,
  GET_VIDEO_FAIL:                 25,
  VIDEO_NOT_FOUND:                26,

  GET_CHATS_SUCCESS:              40,
  GET_CHATS_FAIL:                 41,

  PUT_MATCH_SUCCESS:              50,
  PUT_MATCH_FAIL:                 51,

  AUTHENTICATE_FAIL:              100,
  DOCS_NOT_FOUND:                 101,
  S3_ERROR:                       102
};

module.exports = responseCode;
