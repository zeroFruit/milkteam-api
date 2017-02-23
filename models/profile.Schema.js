import mongoose, {Schema} from 'mongoose';

const ProfileSchema = new Schema({
  originalName: {type: String},
  tag: {type: String},
  link: {type: String}
});

module.exports = ProfileSchema;
