import mongoose, {Schema} from 'mongoose';

const ProfileSchema = new Schema({
  key: {type: String},
  tag: {type: String},
  link: {type: String}
});

module.exports = ProfileSchema;
