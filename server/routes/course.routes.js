// import express because it gives us the ROuter() features
import express from 'express';

// we import the generateCourse controller function from the course.controller.js file, which will handle the logic for generating a course based on the input text
import { generateCourse } from "../controllers/course.controller.js";

// this creates a new router instance from express, which we will use to define our course-related routes
const router = express.Router();

// this defines a POST route at the path "/generate-course" and associates it with the generateCourse controller function, so when a POST request is made to this endpoint, the generateCourse function will be executed to handle the request and generate a course based on the input text
router.post("/generate-course" , generateCourse);

// finally, we export the router so that it can be imported and used in the main server.js file to register the course-related routes with the express app
export default router;