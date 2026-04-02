// This imports the service function.
import { generateCourseContent } from "../services/ai.service.js";

// this is the controller function that will handle the logic for generating a course based on the input topic. It will recieve the topic from the request body , validate it , call the generateCourseContent server function to get the course content and the return the response to the client with the generated course or an error message if something goes wrong
const generateCourse = async ( req , res ) => {
    try {
        const { topic } = req.body;

        if( !topic || !topic.trim() ){
            return res.status(400).json({ // client error , bad request
                success : false,
                message : "Topic is required",
            });
        }

        // controller sends cleaned topic to service layer
        const course = await generateCourseContent(topic.trim());

        return res.status(200).json({
            success : true,
            message : "Course generated successfully",
            data : course,
        });
    } catch (error){
        console.error("Error in generateCourse controller :" , error.message);

        return res.status(500).json({ // server-side problem
            success : false,
            message : "Failed to generate course",
        });
    }
};

export { generateCourse };