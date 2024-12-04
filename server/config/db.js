const mongoose = require('mongoose')

const mongoUrl = 'mongodb://127.0.0.1:27017/chatApp'

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("MongoBD Connected.")
    } catch (error) {
        console.error('MongoDB Connection Error: ', error)
        process.exit(1)
    }
}

module.exports = connectDB