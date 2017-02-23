import mongoose, {Schema} from 'mongoose';

const PreferenceSchema = new Schema({
  character: [{
    type: String,
    required: true
  }],
  position: [{
    type: String,
    required: true
  }],
  tier: [{
    type: String,
    required: true
  }]
});

module.exports = PreferenceSchema;
