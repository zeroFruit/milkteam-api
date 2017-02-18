import {mongoose}   from '../config/mongodb';
import validator    from 'validator';
import _            from 'lodash';
import jwt          from 'jsonwebtoken';
import bcrypt       from 'bcryptjs';
import {Schema}     from 'mongoose';
import PreferenceSchema from './preference.Schema';

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
  password: {
    type: String,
    require: true
  },
  displayName: {
    type: String,
    require: true
  },
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
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'video'
  }],
  preference: [PreferenceSchema]
});

UserSchema.statics.getVideos = function (userId) {
  let User = this;

  return new Promise((resolve, reject) => {
    User.findById(userId).populate('videos').then((user) => {
      const mappedVideos = user.videos.map((video) => {
        return {title: video.title};
      });

      resolve(mappedVideos);
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

  return _.pick(userObject, ['_id', 'email', 'displayName']);
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
