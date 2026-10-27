import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.error("FATAL ERROR: MONGO_URI is not defined in backend/.env!");
            console.error("Please add MONGO_URI=mongodb://127.0.0.1:27017/waste_food_management to backend/.env");
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.error("Make sure your MongoDB server is running on your machine or Atlas URI is valid.");
        process.exit(1);
    }
};

export default connectDB;