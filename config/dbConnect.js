const { default: mongoose} = require ('mongoose');
  
const dbConnect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log('CONNECTED TO DATABASE SUCCESSFULLY');
    } catch (error) {
        console.log('DATBASE ERROR!!')
    }
};

module.exports = dbConnect;