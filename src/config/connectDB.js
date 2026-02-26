import mongoose from "mongoose";

const connectDB = async (ConnectString) => {
  if (!ConnectString) {
    console.error("ERROR: Connection string is undefined. Check your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(ConnectString, {
      writeConcern: { w: "majority" }, // ✅ Fixes write concern warning
    });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;