import {mongoose}   from '../config/mongodb';
import validator    from 'validator';
import _            from 'lodash';
import jwt          from 'jsonwebtoken';
import bcrypt       from 'bcryptjs';
import {Schema}     from 'mongoose';
import PreferenceSchema from './preference.Schema';
import ProfileSchema from './profile.Schema';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail
    }
  },
  password: { type: String, require: true },
  displayName: { type: String, require: true },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }],
  videos: [{ type: Schema.Types.ObjectId, ref: 'video' }],
  preference: [PreferenceSchema],
  profile: [ProfileSchema]
});

UserSchema.statics.getProfileLink = function (userId) {
  let User = this;

  return User.findById(userId).then((user) => {
    return user.profile[0].link;
  });
}

UserSchema.statics.updateProfile = function (userId, profile) {
  let User = this;

  return User.findById(userId).then((user) => {
    if (user.profile.length !== 0) {
      user.profile[0].remove();
      user.profile.push(profile);
    } else {
      user.profile.push(profile);
    }

    return user.save();
  });
}

UserSchema.methods.updatePreference = function(preference) {
  let user = this;

  preference = _.pick(preference, ['character', 'position', 'tier']);

  if (user.preference.length === 0) {
    user.preference.push(preference);
  } else {
    user.preference[0].remove();
    user.preference.push(preference);
  }

  return user.save();
}

UserSchema.statics.getVideos = function (userId) {
  let User = this;

  return new Promise((resolve, reject) => {
    User.findById(userId).populate({
      path: 'videos',
      populate: {
        path: 'match',
        model: 'match',
        populate: {
          path: 'videos',
          model: 'video'
        }
      }
    }).then((user) => {
      let returnVideosArr = user.videos.map((video) => {
        if (video.matched === true) {
          if (video.match.videos[0]._id === video._id) {
            return {
              title: video.title,
              id: video.videoId,
              _id: video._id,
              thumbnail: video.thumbnail,
              viewed: video.match.views,
              likes: video.match.lLikes // 왼쪽 영상의 좋아요 수
            };
          } else {
            return {
              title: video.title,
              id: video.videoId,
              _id: video._id,
              thumbnail: video.thumbnail,
              viewed: video.match.views,
              likes: video.match.rLikes // 오른쪽 영상의 좋아요 수
            };
          }
        } else {
          return {
            title: video.title,
            id: video.videoId,
            _id: video._id,
            thumbnail: video.thumbnail,
            viewed: video.views,
            likes: 0 // 메인 영상일 때 좋아요 수
          };
        }
      });
      resolve(returnVideosArr);
    }).catch((e) => reject(e));
  });
}

UserSchema.methods.uploadVideo = function (video) {
  let user = this;

  user.videos.push(video);

  return new Promise((resolve, reject) => {
    return user.save()
      .then(() => resolve(video))
      .catch((e) => reject(e));
  });
}

UserSchema.methods.deleteVideo = function (video) {
  let user = this;

  return new Promise((resolve, reject) => {
    user.videos = user.videos.filter((videoElt) => videoElt.id !== video.id);

    return user.save()
      .then(() => resolve(video))
      .catch((e) => reject(e));
  })
}

UserSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['email', 'displayName']);
};

UserSchema.methods.generateAuthToken = function () {
  let user    = this;
  let access  = 'auth';
  let token   = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET );

  user.tokens.push({ access, token });

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  let user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

UserSchema.statics.checkToken = function (token) {
  let User = this;
  let decoded;

  if (!token) {
    return Promise.resolve();
  }

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);

    return User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });
  } catch (e) {
    return Promise.reject();
  }
}

UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          reject();
        }
        if (result) {
          resolve(user);
        } else {
          reject();
        }
      });
    })
  });
};

UserSchema.pre('save', function (next) {
  let user = this;
  let password = user.password;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if ( err ) {
          //
        }
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
