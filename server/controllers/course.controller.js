// This imports the service function.
import { generateCourseContent , getAllCourses , getCourseById } from "../services/ai.service.js";

// this is the controller function that will handle the logic for generating a course based on the input topic. 
// it will recieve the topic from the request body , validate it , call the generateCourseContent server function to get the course content and the return the response to the client with the generated course or an error message if something goes wrong
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

// return all saved courses in the database with their modules and lessons (nested population)
const getCourses = async ( req , res ) => {
    try{
        const courses = await getAllCourses();

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: courses,
        });

    }catch(error){
        console.error("Error in getCourses controller : " , error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
        }); 
    }
};

// return detailed information about a specific course by its ID, including its modules and lessons (nested population)
const getCourseDetails = async ( req , res ) => {
    try {
        const { courseId } = req.params;

        const course = await getCourseById(courseId);

        if(!course){
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: course,
        });

    } catch (error) {
        console.error("Error in getCourseDetails controller : " , error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch course details",
        });
    }
};

export { generateCourse , getCourses , getCourseDetails };