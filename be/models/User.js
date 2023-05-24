const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UserSchema = new Schema({
  username: {type: String, required: true, min: 4, unique: true},
  email: {type: String, required: false},
  password: {type: String, required: true},
  profilePicture: {type: String, required: false},
});

const UserModel = model('User', UserSchema);

module.exports = UserModel;