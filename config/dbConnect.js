const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const DB = process.env.MONGO_ATLAS.replace(
      "<password>",
      process.env.DATABASE_PASSWORD
    );

    // Connect to MongoDB Atlas cluster
    await mongoose.connect(DB);

    console.log("DB connection successful");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
};

module.exports = dbConnect;
