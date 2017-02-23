import mongoose from 'mongoose';
import {Schema} from 'mongoose';

const ChatterSchema = new Schema({
  id: { // socket id
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  anonymous: {
    type: Boolean,
    required: true
  },
  videoId: {
    type: String,
    required: true
  }
});

module.exports = ChatterSchema;
