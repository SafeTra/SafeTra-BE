const { default: mongoose } = require('mongoose');

const dbConnect = () => {
  try {
    // const conn = mongoose.connect(process.env.MONGODB_URL);
    // console.log("CONNECTED TO DATABASE SUCCESSFULLY");
    const DB = process.env.MONGO_ATLAS.replace(
      '<password>',
      process.env.DATABASE_PASSWORD
    );

    mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('DB connection successful'));
  } catch (error) {
    console.log('DATBASE ERROR!!');
  }
};

module.exports = dbConnect;
