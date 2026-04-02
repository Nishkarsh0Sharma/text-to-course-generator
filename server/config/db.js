/*
    since server.js calls connectDB(), your db.js should later:
        1. import mongoose 
        2. read MONGO_URI from process.env
        3. connect to MongoDB
        4. log success or failure message

*/ 

import mongoose from "mongoose";

const connectDB = async() => {
    try {
        // try connect mongoose using the connection string from .env
        const connection = await mongoose.connect(process.env.MONGO_URL);

        console.log(`MongoDB connected successfully: ${connection.connection.host}`);

    } catch(error){
        // stop the server process if database connection fails
        process.exit(1);
    }
};


export default connectDB;