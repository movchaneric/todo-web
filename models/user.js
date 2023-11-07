const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String
    },

    image: {
        type: String,
        required: false
    },

    resetTokenExpirationDate: {
        type: Date
    }
})

module.exports = mongoose.model('User', userSchema);
