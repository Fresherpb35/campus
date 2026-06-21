import mongoose from "mongoose";

export const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("db connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
