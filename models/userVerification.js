const { default: mongoose } = require('mongoose');
const mongooose = require('mongoose');


const userVerificationSchema = new mongooose.Schema({
    userId : String,
    uniqueString : String,
    createdAt : Date,
    expiresAt : Date
})


const userVerification = mongoose.model('userVerification', userVerificationSchema)

module.exports = userVerification