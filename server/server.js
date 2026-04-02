// import express , which help us creates the backend server and routes
import express from "express";

// CORS( cross-origin resource sharing ) allows your frontend and backend to talk to each other when they run on different origin like:
// frontend: http://localhost:5173
// backend: http://localhost:5000
// without CORS the browser will block the requests from frontend to backend because of security reasons, so we need to enable CORS in our backend server to allow the frontend to communicate with the backend.
import cors from "cors";

// this loads enviornment variables from a .env
import dotenv from "dotenv";

// we import our MongoDB connection function from a seperate file
import connectDB from "./config/db.js";

// we import the course routes from the course.routes.js file, which will handle all the course-related API endpoints
import courseRoutes from "./routes/course.routes.js";

// this will load the enviornment variables from the .env file and make them available in process.env
dotenv.config();

// this creates an express app instance
const app = express();

const PORT = process.env.PORT || 5000;

// register CORS middleware globally
app.use(cors());

// tells express to automatically parse JSON body data
app.use(express.json());

// this conncects to the MongoDB database using the connection string from the .env file, and it will log a message if the connection is successful or if there is an error
connectDB();

// Health check
// when you open http://localhost:5000/ , you'll know the backend is alive and running, and it will return a JSON response with a success message
app.get("/" , (req , res)=>{
    res.status(200).json({
        success : true,
        message : "Text-to-Course backend is running!"
    });
});

// Mount course related routes under /api/courses path
// example final endpoint : POST /api/courses/generate-course
    // This line mounts the router.
        // Meaning:
            // every route inside courseRoutes
            // will now start with /api/courses
app.use("/api/courses" , courseRoutes);

// this starts the server and listens on the specified PORT, and it will log a message in the console when the server is up and running
app.listen(PORT , ()=>{
     console.log(`Server is running on port ${PORT}`);
});
