import express from 'express';

import { getLessonDetails , generateLessonContent } from "../controllers/lesson.controller.js";


// this creates a new router instance from express, which we will use to define our lesson-related routes
const router = express.Router();

// Fetch one saved lesson by its id
router.get("/:lessonId" , getLessonDetails);

// Generate detailed content for a saved lesson
router.post("/:lessonId/generate" , generateLessonContent);


export default router;