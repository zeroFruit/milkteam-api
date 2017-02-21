import mongoose, {Schema} from 'mongoose';

const AlarmSchema = new Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = AlarmSchema;
