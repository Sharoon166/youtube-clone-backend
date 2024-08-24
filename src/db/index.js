import { connect } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connection = await connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected Successfully to MongoDB");
        console.log(`DB Host: ${connection.connection.host}`);
    } catch (err) {
        console.log("Error while connecting to MongoDB", err);
        process.exit(1);
    }
};

export default connectDB;
