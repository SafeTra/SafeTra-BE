const mongoose = require("mongoose");
const { DATABASE_CREDENTIALS } = require("./env");

const dbConnect = async () => {
  try {
    const DB = DATABASE_CREDENTIALS.DB_URI
    .replace("<password>", DATABASE_CREDENTIALS.DB_PASSWORD)
    .replace("<database-name>", DATABASE_CREDENTIALS.DB_NAME);

    // Connect to MongoDB Atlas cluster
    await mongoose.connect(DB);

    console.log("DB connection successful");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
};

module.exports = dbConnect;
