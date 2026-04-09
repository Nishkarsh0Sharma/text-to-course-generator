import express from 'express';

import { getLessonDetails , generateLessonContent , getLessonVideo } from "../controllers/lesson.controller.js";
import { validateObjectId } from "../middlewares/validate.middleware.js";

// this creates a new router instance from express, which we will use to define our lesson-related routes
const router = express.Router();

// backend endpoint like : GET /api/lessons/video-search/query?query=machine%20learning%20tutorial
// return the first embeddable YouTube video
router.get("/video-search/query" , getLessonVideo);

// Fetch one saved lesson by its id
router.get("/:lessonId" , validateObjectId("lessonId") , getLessonDetails);

// Generate detailed content for a saved lesson
router.post("/:lessonId/generate" , validateObjectId("lessonId") , generateLessonContent);


export default router;