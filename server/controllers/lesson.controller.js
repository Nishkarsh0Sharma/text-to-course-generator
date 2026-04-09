import { getLessonById , generateLessonContentById } from "../services/ai.service.js";
import { searchYouTubeVideo } from "../services/youtube.service.js"

// this is the controller function that will handle the logic for fetching detailed information about a specific lesson by its ID, including its content and any other relevant details. 
// It will receive the lessonId from the request parameters, validate it, call the getLessonById service function to fetch the lesson details from the database, 
// and then return the response to the client with the lesson details or an error message if something goes wrong.
const getLessonDetails = async( req , res ) => {
    try {

        // req.params will give us access to the dynamic parameters in the URL, 
        // in this case :lessonId, so we can extract the lessonId from req.params and use it to fetch the lesson details from the database using the getLessonById service function.
        const { lessonId } = req.params;
        const creator = req.auth?.payload?.sub;

        const lesson = await getLessonById(lessonId,creator);

        if(!lesson){
            return res.status(404).json({
                success: false,
                message: "Lesson not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lesson fetched successfully",
            data: lesson,
        });
    } catch (error) {
        console.error("Error in getLessonDetails controller:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch lesson details",
        });
    }

};

// this is the controller function that will handle the logic for generating the content(Enriched content) of a specific lesson by its ID.
const generateLessonContent = async( req , res ) => {
    try {
        const { lessonId } = req.params;
        const creator = req.auth?.payload?.sub;
        const lesson = await generateLessonContentById(lessonId, creator);

        if(!lesson){
            return res.status(404).json({
                success: false,
                message: "Lesson not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lesson content generated successfully",
            data: lesson,
        });

    } catch (error) {
        console.error("Error in generatedLessonContent controller:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to generate lesson content",
        });
    }
};

// return the first embeddable YouTube video from searchYouTubeVideo
const getLessonVideo = async(req,res) => {
    try {
        const { query } = req.query;

        if(!query || !query.trim()){
            return res.status(400).json({
                success: false,
                message: "Query is required",
            });
        }

        const video = await searchYouTubeVideo(query.trim());

        if(!video){
            return res.status(404).json({
                success: false,
                message: "No video found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Video fetched successfully.",
            data: video,
        });

    } catch (error) {
        console.error("Error in getLessonVideo controller:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch lesson video."
        });
    }
};


export {
    getLessonDetails,
    generateLessonContent,
    getLessonVideo,
};
