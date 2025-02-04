const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    faceImage: String  // Path to the stored image
});

module.exports = mongoose.model('User', UserSchema);
