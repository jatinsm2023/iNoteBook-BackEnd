const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;

const connectToMongo = () => {
    mongoose.connect(mongoURI)
        .then(() => console.log('Connected!'));
    }

module.exports = connectToMongo;