import mongoose, {Schema} from 'mongoose';

const ChatSchema = new Schema({
  displayName: { type: String, required: true },
  text: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = ChatSchema;
