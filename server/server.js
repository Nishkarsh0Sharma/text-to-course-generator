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
import lessonRoutes from "./routes/lesson.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// this will load the enviornment variables from the .env file and make them available in process.env
dotenv.config();

// this creates an express app instance
const app = express();

const PORT = process.env.PORT || 5000;

// register CORS middleware globally
app.use(cors());

// tells express to automatically parse JSON body data
app.use(express.json());

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

app.use("/api/lessons", lessonRoutes);

app.use(errorHandler); // global error handling middleware

const startServer = async () => {
    try {
        // Connect to the database before accepting API requests.
        await connectDB();

        app.listen(PORT , ()=>{
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
