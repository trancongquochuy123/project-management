const mongoose = require('mongoose');

module.exports.connect = async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
