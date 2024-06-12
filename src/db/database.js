import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
       const connetionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`mongodb connected successfully db host: ${connetionInstance.connection.host}`);
    } catch (error) {
        console.log("mongodb connection failed any reason",error);
        process.exit(1);
    }
}
export default connectDB ;