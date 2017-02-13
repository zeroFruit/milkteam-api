import {ObjectID} from 'mongodb';
import jwt        from 'jsonwebtoken';

import {User}     from '../../models/user';

const userOneId = new ObjectID();
const userTwoId = new ObjectID();


const users = [{
  _id: userOneId,
  email: 'userOne@example.com',
  password: 'userOnePass',
  displayName: 'displayNameOne',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'userTwo@example.com',
  password: 'userTwoPass',
  displayName: 'displayNameTwo',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {users, populateUsers};
