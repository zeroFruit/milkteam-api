import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

before((done) => {
  mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection
    .once('open', () => done())
    .on('error', (error) => console.warn('Error', error));
});

beforeEach((done) => {
  // init db collections
});
