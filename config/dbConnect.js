const { default: mongoose } = require("mongoose")

const dbConnect = () => {
    try {
        const conn = mongoose.connect('mongodb://127.0.0.1:27017/safeTra+');
        console.log('CONNECTED TO DATABASE SUCCESSFULLY');
    } catch (error) {
        console.log("DATABASE ERROR!!");
    }
    
}

module.exports = dbConnect;
