import mongoose from "mongoose";
import { MESSAGES } from "../utils/messages.js";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`${MESSAGES.GENERAL.DB_CONNECT_ERROR}: ${error.message}`);
    process.exit(1);
  }
};
export default connectDB;
