import mongoose from 'mongoose';
import {Schema} from 'mongoose';

const ChatterSchema = new Schema({
  id: { // socket id
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true,
    unique: true
  },
  anonymous: {
    type: Boolean,
    required: true
  }
});

module.exports = ChatterSchema;
