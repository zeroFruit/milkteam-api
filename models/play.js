import {mongoose}     from '../config/mongodb';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  videoId: {
    type: String,
    requied: true
  },
  champion: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    required: true
  },
  attribute: {
    type: String,
    required: true
  }
});

const Video = mongoose.model('video', VideoSchema);

module.exports = {Video};
