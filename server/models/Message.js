const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
    sender: {type: String, required: true},
    receiver: {type: String},
    message: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    public: {type: Boolean}
})

module.exports = mongoose.model("Message", messageSchema)